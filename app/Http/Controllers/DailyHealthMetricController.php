<?php

namespace App\Http\Controllers;

use App\Models\DailyHealthMetric;
use App\Services\StreakService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class DailyHealthMetricController extends Controller
{
    public function index(Request $request)
    {
        $clientDate = $request->query('client_date', now()->toDateString());
        $user = $request->user();

        // Break stored streak to 0 only when user has missed 2+ days
        StreakService::checkAndBreakStreak($user);
        $user = $user->fresh();

        $metrics = DailyHealthMetric::firstOrCreate(
            ['user_id' => $user->id, 'date' => $clientDate],
            ['water_glasses' => 0, 'steps' => 0, 'sleep_minutes' => 0, 'workout_calories_burned' => 0]
        );

        // Show streak only if the user has already logged a meal today.
        // On a new day before logging, display 0 so the badge reflects reality.
        $today = now()->toDateString();
        $displayStreak = ($user->last_activity_date === $today) ? $user->current_streak : 0;

        return response()->json(['metrics' => $metrics, 'streak' => $displayStreak]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'client_date' => 'required|date_format:Y-m-d',
            'field' => 'required|in:water_glasses,steps,sleep_minutes,workout_calories_burned',
            'value' => 'required|integer|min:0',
        ]);

        $metrics = DailyHealthMetric::firstOrCreate(
            ['user_id' => $request->user()->id, 'date' => $request->client_date]
        );

        $metrics->update([
            $request->field => $request->value,
        ]);

        // Streak is only driven by meal logging — do NOT call processActivity here.
        return response()->json(['success' => true, 'metrics' => $metrics, 'streak' => $request->user()->current_streak]);
    }

    public function analyzeStepsBurn(Request $request)
    {
        $request->validate([
            'steps' => 'required|integer|min:0',
        ]);

        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $apiKey = config('services.nvidia.key');
        if (! $apiKey) {
            return response()->json(['error' => 'Nvidia API key is not configured.'], 500);
        }

        $prompt = "You are a biological fitness calculator AI. A {$user->age}-year-old {$user->gender} weighing {$user->weight_kg}kg with a height of {$user->height_cm}cm has just walked {$request->steps} steps.\n"
                ."Calculate the precise total calories burned from this walking activity organically based solely on those metrics.\n"
                .'Return strictly a JSON object with this exact structure (an integer): {"calories_burned": 0}. Do not include markdown blocks or any other text.';

        try {
            $response = Http::timeout(90)->retry(2, 1000)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Accept' => 'application/json',
            ])->post('https://integrate.api.nvidia.com/v1/chat/completions', [
                'model' => 'google/gemma-4-31b-it',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 100,
                'temperature' => 0.1,
                'stream' => false,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $responseText = $data['choices'][0]['message']['content'] ?? null;

                if ($responseText) {
                    $jsonContent = trim($responseText);
                    if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/', $jsonContent, $matches)) {
                        $jsonContent = $matches[1];
                    }
                    $start = strpos($jsonContent, '{');
                    $end = strrpos($jsonContent, '}');
                    if ($start !== false && $end !== false) {
                        $jsonContent = substr($jsonContent, $start, $end - $start + 1);
                    }

                    $result = json_decode($jsonContent, true);

                    if (json_last_error() === JSON_ERROR_NONE && isset($result['calories_burned'])) {
                        return response()->json([
                            'success' => true,
                            'calories_burned' => $result['calories_burned'],
                        ]);
                    }

                    return response()->json(['error' => 'AI returned invalid JSON structure', 'details' => $jsonContent], 500);
                }
            }

            return response()->json(['error' => 'HTTP request to AI failed'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Controller logic crashed', 'details' => $e->getMessage()], 500);
        }
    }

    public function history(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Get the last 7 days of dates explicitly (including today)
        $history = DailyHealthMetric::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->take(7)
            ->get()
            ->reverse() // chronological order for rendering charts
            ->values();

        return response()->json([
            'success' => true,
            'history' => $history,
            'goal' => $user->daily_active_burn_target ?? 400,
        ]);
    }

    public function analyzeActivityBurn(Request $request)
    {
        $request->validate([
            'activity_name' => 'required|string|max:100',
            'duration_minutes' => 'required|integer|min:1|max:600',
        ]);

        $user = $request->user();
        $apiKey = config('services.nvidia.key');
        if (! $apiKey) {
            return response()->json(['error' => 'Nvidia API key is not configured.'], 500);
        }

        $prompt = "You are a biological fitness calculator AI. A {$user->age}-year-old {$user->gender} weighing {$user->weight_kg}kg with a height of {$user->height_cm}cm has just completed a physical activity: '{$request->activity_name}' for {$request->duration_minutes} contiguous minutes.\n"
                ."Calculate the precise total calories burned from this activity intensity organically based solely on those physiological metrics.\n"
                .'Return strictly a JSON object with this exact structure (an integer): {"calories_burned": 0}. Do not include markdown blocks or any other text.';

        try {
            $response = Http::timeout(90)->retry(2, 1000)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Accept' => 'application/json',
            ])->post('https://integrate.api.nvidia.com/v1/chat/completions', [
                'model' => 'google/gemma-4-31b-it',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 100,
                'temperature' => 0.1,
                'stream' => false,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $responseText = $data['choices'][0]['message']['content'] ?? null;

                if ($responseText) {
                    $jsonContent = trim($responseText);
                    if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/', $jsonContent, $matches)) {
                        $jsonContent = $matches[1];
                    }
                    $start = strpos($jsonContent, '{');
                    $end = strrpos($jsonContent, '}');
                    if ($start !== false && $end !== false) {
                        $jsonContent = substr($jsonContent, $start, $end - $start + 1);
                    }

                    $result = json_decode($jsonContent, true);

                    if (json_last_error() === JSON_ERROR_NONE && isset($result['calories_burned'])) {
                        return response()->json([
                            'success' => true,
                            'calories_burned' => $result['calories_burned'],
                        ]);
                    }
                }
            }

            return response()->json(['error' => 'HTTP request to AI failed', 'details' => $response->body()], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Activity AI crashed', 'details' => $e->getMessage()], 500);
        }
    }
}
