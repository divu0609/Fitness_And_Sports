<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
            return Inertia::render('Dashboard');
        }
    )->name('dashboard');

    Route::get('/insights', [\App\Http\Controllers\InsightsController::class, 'index'])->name('insights');
    Route::get('/history', [\App\Http\Controllers\HistoryController::class, 'index'])->name('history');
    
    Route::get('/api/meals', [\App\Http\Controllers\AiMealController::class, 'index']);
    Route::post('/api/meals/analyze', [\App\Http\Controllers\AiMealController::class, 'analyzeAndSave']);
    Route::post('/api/profile/calculate-targets', [\App\Http\Controllers\AiMealController::class, 'calculateUserTargets']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
