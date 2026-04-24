<?php

use App\Http\Controllers\AiMealController;
use App\Http\Controllers\BmiController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\DailyHealthMetricController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\InsightsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::post('/api/bmi/analyze', [BmiController::class, 'analyze'])->name('bmi.analyze');

// Community — public browsing (no auth required)
Route::get('/community', [CommunityController::class, 'index'])->name('community');
Route::get('/community/posts/{post}/comments', [CommunityController::class, 'comments'])->name('community.comments');
Route::get('/community/feed', [CommunityController::class, 'feed'])->name('community.feed');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('Dashboard');
    }
    )->name('dashboard');

    Route::get('/insights', [InsightsController::class, 'index'])->name('insights');
    Route::get('/history', [HistoryController::class, 'index'])->name('history');

    Route::get('/api/meals', [AiMealController::class, 'index']);
    Route::post('/api/meals/analyze', [AiMealController::class, 'analyzeAndSave']);
    Route::post('/api/profile/calculate-targets', [AiMealController::class, 'calculateUserTargets']);
    Route::patch('/api/profile/weight', [AiMealController::class, 'updateWeight']);

    Route::get('/workouts', function () {
        return Inertia::render('Workouts');
    })->name('workouts');

    Route::get('/api/metrics', [DailyHealthMetricController::class, 'index']);
    Route::post('/api/metrics', [DailyHealthMetricController::class, 'update']);
    Route::post('/api/metrics/analyze-steps', [DailyHealthMetricController::class, 'analyzeStepsBurn']);
    Route::get('/api/metrics/history', [DailyHealthMetricController::class, 'history']);
    Route::post('/api/metrics/analyze-activity', [DailyHealthMetricController::class, 'analyzeActivityBurn']);

    // Community auth-gated actions
    Route::post('/community/posts', [CommunityController::class, 'store'])->name('community.store');
    Route::post('/community/posts/{post}/like', [CommunityController::class, 'like'])->name('community.like');
    Route::post('/community/posts/{post}/comment', [CommunityController::class, 'comment'])->name('community.comment');
    Route::post('/community/challenges/{challenge}/join', [CommunityController::class, 'joinChallenge'])->name('community.join');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
