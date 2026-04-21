<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::get('/meals', [\App\Http\Controllers\AiMealController::class, 'index']);
    Route::post('/meals/analyze', [\App\Http\Controllers\AiMealController::class, 'analyzeAndSave']);
});
