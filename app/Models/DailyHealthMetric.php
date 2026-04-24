<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyHealthMetric extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'water_glasses',
        'steps',
        'sleep_minutes',
        'workout_calories_burned',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
