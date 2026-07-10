<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CalendarDayController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\TimelineController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'service' => 'taghvim-defa-api',
]));

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/timeline', [TimelineController::class, 'index']);
Route::get('/timeline/stats', [TimelineController::class, 'stats']);
Route::get('/timeline/{date}', [TimelineController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/days', [CalendarDayController::class, 'index']);
    Route::post('/days', [CalendarDayController::class, 'store']);
    Route::put('/days/{calendarDay}', [CalendarDayController::class, 'update']);
    Route::delete('/days/{calendarDay}', [CalendarDayController::class, 'destroy']);

    Route::post('/days/{calendarDay}/enemy-actions', [CalendarDayController::class, 'storeEnemyAction']);
    Route::post('/days/{calendarDay}/government-actions', [CalendarDayController::class, 'storeGovernmentAction']);
    Route::post('/days/{calendarDay}/media', [CalendarDayController::class, 'uploadMedia']);
    Route::post('/enemy-actions/{enemyAction}/media', [CalendarDayController::class, 'uploadEnemyMedia']);
    Route::post('/government-actions/{governmentAction}/media', [CalendarDayController::class, 'uploadGovernmentMedia']);

    Route::post('/categories', [CategoryController::class, 'store']);
});
