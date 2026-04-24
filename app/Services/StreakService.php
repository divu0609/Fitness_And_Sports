<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

class StreakService
{
    /**
     * Called whenever the user logs a meal. Increments or resets the streak
     * depending on whether they were active yesterday.
     */
    public static function processActivity(User $user, $clientDateString = null): void
    {
        $today = $clientDateString
            ? Carbon::parse($clientDateString)->toDateString()
            : now()->toDateString();

        if (! $user->last_activity_date) {
            // Very first tracking day ever
            $user->update([
                'current_streak' => 1,
                'last_activity_date' => $today,
            ]);

            return;
        }

        $lastDate = Carbon::parse($user->last_activity_date);
        $currentDate = Carbon::parse($today);
        $diffInDays = $lastDate->diffInDays($currentDate, false);

        if ($diffInDays === 0) {
            // Already logged today — nothing to change
            return;
        }

        if ($diffInDays === 1) {
            // Perfect consecutive day — extend streak
            $user->update([
                'current_streak' => $user->current_streak + 1,
                'last_activity_date' => $today,
            ]);
        } else {
            // Missed one or more days — streak fully resets then starts fresh at 1
            $user->update([
                'current_streak' => 1,
                'last_activity_date' => $today,
            ]);
        }
    }

    /**
     * Called on dashboard load. If the user's last_activity_date is more than
     * 1 day ago AND they have no calories logged today, their streak is broken
     * and immediately reset to 0 so the UI reflects reality.
     */
    public static function checkAndBreakStreak(User $user): void
    {
        if (! $user->last_activity_date || $user->current_streak <= 0) {
            return;
        }

        $today = now()->toDateString();
        $lastDate = Carbon::parse($user->last_activity_date)->toDateString();

        // Already up-to-date
        if ($lastDate === $today) {
            return;
        }

        $gapDays = Carbon::parse($lastDate)->diffInDays(Carbon::parse($today));

        if ($gapDays > 1) {
            // Missed at least one full day — break streak to 0
            $user->update(['current_streak' => 0]);
        } elseif ($gapDays === 1) {
            // Last active was yesterday: streak is still valid today (they haven't
            // logged yet today but haven't missed a day yet). Keep as-is.
        }
    }
}
