<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class BmiController extends Controller
{
    public function analyze(Request $request)
    {
        $request->validate([
            'height_cm' => 'required|numeric|min:50|max:300',
            'weight_kg' => 'required|numeric|min:1|max:500',
            'age' => 'required|integer|min:5|max:120',
            'gender' => 'required|in:male,female',
        ]);

        $height = $request->height_cm;
        $weight = $request->weight_kg;
        $age = $request->age;
        $gender = $request->gender;

        // Calculate BMI server-side for accuracy
        $heightM = $height / 100;
        $bmi = round($weight / ($heightM * $heightM), 1);

        $apiKey = config('services.nvidia.key');

        if (! $apiKey) {
            return response()->json(['error' => 'AI service not configured.'], 500);
        }

        $prompt = "You are an expert certified nutritionist and fitness physician. Analyze the following person's vitals:\n"
            ."- Gender: {$gender}\n"
            ."- Age: {$age} years\n"
            ."- Height: {$height} cm\n"
            ."- Weight: {$weight} kg\n"
            ."- BMI: {$bmi}\n\n"
            ."Provide a health analysis in strict JSON with these exact keys:\n"
            ."{\n"
            ."  \"bmi\": <number>,\n"
            ."  \"category\": \"<Underweight|Normal|Overweight|Obese>\",\n"
            ."  \"body_fat_estimate\": \"<string like '18-22%'>\",\n"
            ."  \"ideal_weight_range\": \"<string like '65-72 kg'>\",\n"
            ."  \"health_risk\": \"<Low|Moderate|High|Very High>\",\n"
            ."  \"summary\": \"<1-2 sentence honest clinical summary specific to gender and age>\",\n"
            ."  \"tip\": \"<1 actionable fitness or nutrition tip tailored to this person>\"\n"
            ."}\n"
            .'Return only the raw JSON. No markdown, no explanation.';

        try {
            $response = Http::timeout(90)->retry(2, 1000)->withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Accept' => 'application/json',
            ])->post('https://integrate.api.nvidia.com/v1/chat/completions', [
                'model' => 'google/gemma-4-31b-it',
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 350,
                'temperature' => 0.2,
                'stream' => false,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $rawText = $data['choices'][0]['message']['content'] ?? null;

                if ($rawText) {
                    // Strip markdown code fences if present
                    $json = trim($rawText);
                    if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/', $json, $m)) {
                        $json = $m[1];
                    }
                    $start = strpos($json, '{');
                    $end = strrpos($json, '}');
                    if ($start !== false && $end !== false) {
                        $json = substr($json, $start, $end - $start + 1);
                    }

                    $result = json_decode($json, true);

                    if (json_last_error() === JSON_ERROR_NONE) {
                        return response()->json(['success' => true, 'data' => $result]);
                    }
                }
            }

            // Fallback — return calculated BMI with no AI enrichment
            return response()->json([
                'success' => true,
                'data' => [
                    'bmi' => $bmi,
                    'category' => $this->getCategory($bmi),
                    'body_fat_estimate' => 'N/A',
                    'ideal_weight_range' => 'N/A',
                    'health_risk' => 'N/A',
                    'summary' => 'AI analysis unavailable. Please try again later.',
                    'tip' => 'Maintain a balanced diet and exercise regularly.',
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'AI request failed: '.$e->getMessage()], 500);
        }
    }

    private function getCategory(float $bmi): string
    {
        if ($bmi < 18.5) {
            return 'Underweight';
        }
        if ($bmi < 25) {
            return 'Normal';
        }
        if ($bmi < 30) {
            return 'Overweight';
        }

        return 'Obese';
    }
}
