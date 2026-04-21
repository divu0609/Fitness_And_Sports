<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MealLog extends Model
{
    protected $fillable = [
        'user_id',
        'meal_type',
        'date',
        'food_description',
        'calories',
        'protein',
        'carbs',
        'fats'
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
