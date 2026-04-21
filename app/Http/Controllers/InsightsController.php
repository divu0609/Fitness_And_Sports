<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MealLog;
use Carbon\Carbon;

class InsightsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Grab date from query parameter, or default to today
        $targetDateString = $request->query('date', now()->toDateString());
        $targetDate = Carbon::parse($targetDateString);

        // 1. Fetch exact meals for that date
        $mealsOnDate = MealLog::where('user_id', $user->id)
            ->where('date', $targetDate->toDateString())
            ->get();

        // 2. Aggregate the total macros perfectly
        $totalCalories = $mealsOnDate->sum('calories');
        $totalProtein = $mealsOnDate->sum('protein');
        $totalCarbs = $mealsOnDate->sum('carbs');
        $totalFats = $mealsOnDate->sum('fats');

        // 3. Fetch past 7 days for the trends chart
        $startDate = $targetDate->copy()->subDays(6);
        $weeklyLogs = MealLog::where('user_id', $user->id)
            ->whereBetween('date', [$startDate->toDateString(), $targetDate->toDateString()])
            ->get();

        $weeklyTrends = [];
        $currentDate = $startDate->copy();
        
        // We ensure all 7 days have an object, even if 0 calories logged
        while ($currentDate <= $targetDate) {
            $dayStr = $currentDate->toDateString();
            $dayData = $weeklyLogs->where('date', $dayStr);
            
            $weeklyTrends[] = [
                'date' => $dayStr,
                'short_day' => strtoupper($currentDate->format('D')), // 'MON'
                'day_num' => $currentDate->format('d'), // '15'
                'calories' => $dayData->sum('calories'),
                'protein' => $dayData->sum('protein'),
                'carbs' => $dayData->sum('carbs'),
                'fats' => $dayData->sum('fats'),
            ];
            
            $currentDate->addDay();
        }

        // Return the massive blob to React
        return Inertia::render('Insights', [
            'targetDate' => $targetDate->toDateString(),
            'mealsOnDate' => $mealsOnDate,
            'aggregates' => [
                'calories' => $totalCalories,
                'protein' => $totalProtein,
                'carbs' => $totalCarbs,
                'fats' => $totalFats,
            ],
            'weeklyTrends' => $weeklyTrends,
        ]);
    }
}
