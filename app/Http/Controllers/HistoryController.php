<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MealLog;
use Carbon\Carbon;

class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Target month calculation
        $month = $request->query('month', now()->month);
        $year = $request->query('year', now()->year);
        
        // Parse a base date to derive the month's metrics
        $targetDate = Carbon::createFromDate($year, $month, 1);
        $startOfMonth = $targetDate->copy()->startOfMonth();
        $endOfMonth = $targetDate->copy()->endOfMonth();

        // Query the entire month's meal logs
        $mealLogs = MealLog::where('user_id', $user->id)
            ->whereBetween('date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->get();

        // Structure a hash map of 'date_string' => total_calories
        $dailyTotals = [];
        foreach ($mealLogs as $log) {
            if (!isset($dailyTotals[$log->date])) {
                $dailyTotals[$log->date] = 0;
            }
            $dailyTotals[$log->date] += $log->calories;
        }

        return Inertia::render('History', [
            'currentMonth' => $month,
            'currentYear' => $year,
            'monthName' => $targetDate->format('F'), // e.g. "April"
            'totalDaysInMonth' => $targetDate->daysInMonth,
            'firstDayOfWeek' => $startOfMonth->dayOfWeek, // 0 = Sunday, 1 = Monday
            'dailyTotals' => $dailyTotals,
            'dailyGoal' => $user->daily_calorie_target ?? 2000
        ]);
    }
}
