<?php

namespace App\Http\Controllers;

use App\Models\MealLog;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiMealController extends Controller
{
    public function analyzeAndSave(Request $request)
    {
        $request->validate([
            'food_description' => 'required|string|max:500',
            'meal_type' => 'required|string|in:Breakfast,Morning Snack,Lunch,Evening Snack,Dinner',
            'client_date' => 'nullable|date_format:Y-m-d',
        ]);

        $apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY');

        if (! $apiKey) {
            return response()->json(['error' => 'Gemini API key is not configured.'], 500);
        }

        $prompt = "You are a nutritionist AI. Estimate the total nutritional content of the following meal description: '{$request->food_description}'. You MUST return ONLY a valid raw JSON object representing the totals in this exact structure, with all values as integers (grams for macros, kcal for calories): {\"calories\": 0, \"protein\": 0, \"carbs\": 0, \"fats\": 0}. Do not include markdown code blocks, backticks, or any other text.";

        try {
            $response = Http::timeout(30)->withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();

                // Navigate Gemini response structure
                $responseText = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if ($responseText) {
                    $jsonContent = trim($responseText);

                    // Resilient JSON extraction
                    if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/', $jsonContent, $matches)) {
                        $jsonContent = $matches[1];
                    }
                    $start = strpos($jsonContent, '{');
                    $end = strrpos($jsonContent, '}');
                    if ($start !== false && $end !== false) {
                        $jsonContent = substr($jsonContent, $start, $end - $start + 1);
                    }

                    $nutrition = json_decode($jsonContent, true);

                    if (json_last_error() === JSON_ERROR_NONE && isset($nutrition['calories'])) {

                        $mealLog = MealLog::create([
                            'user_id' => $request->user()->id ?? 1, // Fallback to 1 if auth missing in dev
                            'meal_type' => $request->meal_type,
                            'date' => $request->client_date ?? now()->toDateString(),
                            'food_description' => $request->food_description,
                            'calories' => $nutrition['calories'],
                            'protein' => $nutrition['protein'],
                            'carbs' => $nutrition['carbs'],
                            'fats' => $nutrition['fats'],
                        ]);

                        // Fire off streak logic!
                        StreakService::processActivity($request->user(), $request->client_date);

                        return response()->json([
                            'success' => true,
                            'meal' => $mealLog,
                            'streak' => $request->user()->current_streak,
                        ]);
                    }

                    return response()->json(['error' => 'AI returned invalid JSON structure', 'details' => $jsonContent], 500);
                }

                return response()->json(['error' => 'AI returned empty response text (blocked?)', 'details' => $data], 500);
            }

            return response()->json(['error' => 'HTTP request to AI failed', 'details' => $response->body()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Controller logic crashed', 'details' => $e->getMessage()], 500);
        }
    }

    public function calculateUserTargets(Request $request)
    {
        $request->validate([
            'age' => 'required|integer|min:10|max:100',
            'gender' => 'required|string|in:male,female',
            'height_cm' => 'required|integer|min:100|max:250',
            'weight_kg' => 'required|numeric|min:30|max:250',
            'target_weight_kg' => 'required|numeric|min:30|max:250',
            'target_months' => 'required|integer|min:1|max:60',
            'goal_type' => 'required|string|in:Weight Loss,Weight Gain,Maintain Weight,Muscle Gain',
            'activity_level' => 'required|string|in:Sedentary,Light,Moderate,Active',
        ]);

        $weight = $request->weight_kg;
        $targetWeight = $request->target_weight_kg;
        $goalType = $request->goal_type;

        if ($goalType === 'Weight Loss' && $targetWeight >= $weight) {
            return response()->json(['message' => 'For Weight Loss, target weight must be less than current weight.'], 422);
        }
        if (($goalType === 'Weight Gain' || $goalType === 'Muscle Gain') && $targetWeight <= $weight) {
            return response()->json(['message' => 'For Weight/Muscle Gain, target weight must be greater than current weight.'], 422);
        }
        if ($goalType === 'Maintain Weight' && $targetWeight != $weight) {
            return response()->json(['message' => 'For Maintain Weight, target weight must equal current weight.'], 422);
        }

        try {
            $height = $request->height_cm;
            $age = $request->age;
            $gender = $request->gender;

            // Step 1: BMR (Mifflin-St Jeor)
            if ($gender === 'male') {
                $bmr = (10 * $weight) + (6.25 * $height) - (5 * $age) + 5;
            } else {
                $bmr = (10 * $weight) + (6.25 * $height) - (5 * $age) - 161;
            }

            // Step 2: TDEE
            $activityFactors = [
                'Sedentary' => 1.2,
                'Light' => 1.375,
                'Moderate' => 1.55,
                'Active' => 1.725,
            ];
            $tdee = $bmr * $activityFactors[$request->activity_level];

            // Step 3: Target Calories Based on Goal
            $targetCalories = $tdee;
            $goalType = $request->goal_type;

            if ($goalType === 'Weight Loss') {
                $totalDeficit = ($weight - $request->target_weight_kg) * 7700;
                $dailyDeficit = $totalDeficit / max(1, ($request->target_months * 30));
                $targetCalories = $tdee - $dailyDeficit;
            } elseif ($goalType === 'Weight Gain') {
                $targetCalories = $tdee + 400; // Adding ~400 calorie surplus
            } elseif ($goalType === 'Muscle Gain') {
                $targetCalories = $tdee + 300; // Lean surplus
            } elseif ($goalType === 'Maintain Weight') {
                $targetCalories = $tdee;
            }

            // Ensure calories don't drop to dangerous levels
            $targetCalories = max(1200, round($targetCalories));

            // Macros Calculation
            // Protein: ~2.2g per kg (higher for muscle gain)
            $proteinGrams = round($weight * ($goalType === 'Muscle Gain' ? 2.4 : 2.2));
            $proteinCalories = $proteinGrams * 4;

            // Fats: 25% of total calories
            $fatCalories = $targetCalories * 0.25;
            $fatGrams = round($fatCalories / 9);

            // Carbs: Remaining calories
            $carbCalories = $targetCalories - $proteinCalories - $fatCalories;
            $carbGrams = max(0, round($carbCalories / 4));

            // Workout Burn Target (based on activity level)
            $burnTargets = [
                'Sedentary' => 200,
                'Light' => 300,
                'Moderate' => 450,
                'Active' => 600,
            ];
            $workoutBurnTarget = $burnTargets[$request->activity_level];

            // Save to authenticated user
            $user = $request->user();
            $user->update([
                'age' => $age,
                'gender' => $gender,
                'height_cm' => $height,
                'weight_kg' => $weight,
                'target_weight_kg' => $request->target_weight_kg,
                'target_months' => $request->target_months,
                'fitness_goal' => $goalType,
                'activity_level' => $request->activity_level,
                'daily_calorie_target' => $targetCalories,
                'daily_protein_target' => $proteinGrams,
                'daily_carbs_target' => $carbGrams,
                'daily_fats_target' => $fatGrams,
                'daily_active_burn_target' => $workoutBurnTarget,
            ]);

            return response()->json([
                'success' => true,
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Calculation logic crashed', 'details' => $e->getMessage()], 500);
        }
    }

    // Endpoint to load today's meals for the dashboard
    public function index(Request $request)
    {
        $clientDate = $request->query('client_date', now()->toDateString());

        $meals = MealLog::where('user_id', $request->user()->id ?? 1)
            ->where('date', $clientDate)
            ->get();

        return response()->json(['meals' => $meals]);
    }

    // Quick-update the user's current body weight
    public function updateWeight(Request $request)
    {
        $request->validate([
            'weight_kg' => 'required|numeric|min:20|max:300',
        ]);

        $user = $request->user();
        $user->update(['weight_kg' => $request->weight_kg]);

        return response()->json([
            'success' => true,
            'weight_kg' => $user->weight_kg,
            'target_weight_kg' => $user->target_weight_kg,
        ]);
    }
}
