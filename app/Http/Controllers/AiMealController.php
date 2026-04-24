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

        $apiKey = config('services.nvidia.key');

        if (! $apiKey) {
            return response()->json(['error' => 'Nvidia API key is not configured.'], 500);
        }

        $prompt = "You are a nutritionist AI. Estimate the total nutritional content of the following meal description: '{$request->food_description}'. You MUST return ONLY a valid raw JSON object representing the totals in this exact structure, with all values as integers (grams for macros, kcal for calories): {\"calories\": 0, \"protein\": 0, \"carbs\": 0, \"fats\": 0}. Do not include markdown code blocks, backticks, or any other text.";

        try {
            $response = Http::timeout(90)->retry(2, 1000)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Accept' => 'application/json',
            ])->post('https://integrate.api.nvidia.com/v1/chat/completions', [
                'model' => 'google/gemma-4-31b-it',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 1000,
                'temperature' => 0.1,
                'stream' => false,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                // Navigate OpenAI-compatible response structure
                $responseText = $data['choices'][0]['message']['content'] ?? null;

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
        ]);

        $apiKey = config('services.nvidia.key');
        if (! $apiKey) {
            return response()->json(['error' => 'Nvidia API key is not configured.'], 500);
        }

        $prompt = "You are an expert fitness AI. A user has the following profile:\n"
                ."Age: {$request->age}\n"
                ."Gender: {$request->gender}\n"
                ."Height: {$request->height_cm} cm\n"
                ."Current Weight: {$request->weight_kg} kg\n"
                ."Target Weight: {$request->target_weight_kg} kg\n"
                ."Timeline to reach target: {$request->target_months} months\n\n"
                ."Calculate their precise daily nutritional target emphasizing their requested timeline gracefully. Also calculate an explicit optimal daily active calorie burn target ('workout_burn_target') to hit this timeline. \n"
                .'Return strictly a JSON object with this exact structure (all integers): {"calories": 0, "protein": 0, "carbs": 0, "fats": 0, "workout_burn_target": 0}. Do not include markdown blocks or any other explanation text.';

        try {
            $response = Http::timeout(90)->retry(2, 1000)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Accept' => 'application/json',
            ])->post('https://integrate.api.nvidia.com/v1/chat/completions', [
                'model' => 'google/gemma-4-31b-it',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 1000,
                'temperature' => 0.1,
                'stream' => false,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $responseText = $data['choices'][0]['message']['content'] ?? null;

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

                    $targets = json_decode($jsonContent, true);

                    if (json_last_error() === JSON_ERROR_NONE && isset($targets['calories'])) {

                        // Save to authenticated user
                        $user = $request->user();
                        $user->update([
                            'age' => $request->age,
                            'gender' => $request->gender,
                            'height_cm' => $request->height_cm,
                            'weight_kg' => $request->weight_kg,
                            'target_weight_kg' => $request->target_weight_kg,
                            'target_months' => $request->target_months,
                            'daily_calorie_target' => $targets['calories'],
                            'daily_protein_target' => $targets['protein'],
                            'daily_carbs_target' => $targets['carbs'],
                            'daily_fats_target' => $targets['fats'],
                            'daily_active_burn_target' => $targets['workout_burn_target'] ?? 400,
                        ]);

                        return response()->json([
                            'success' => true,
                            'user' => $user,
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
