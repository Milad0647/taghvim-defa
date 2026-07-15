<?php

use App\Http\Controllers\Api\V1\ArchiveController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BackupController;
use App\Http\Controllers\Api\V1\CalendarDayController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\FormSchemaController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\TimelineController;
use App\Http\Controllers\Api\V1\UserController;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::get('/health', function () {
    $dbOk = false;
    $hasUsername = false;
    $userQueryOk = false;
    $cacheOk = false;
    $error = null;

    try {
        DB::connection()->getPdo();
        $dbOk = true;
        $hasUsername = Schema::hasColumn('users', 'username');
        User::query()->limit(1)->exists();
        $userQueryOk = true;
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }

    try {
        Cache::put('healthcheck', '1', 5);
        $cacheOk = Cache::get('healthcheck') === '1';
    } catch (Throwable $e) {
        $error = $error ?? $e->getMessage();
    }

    $ready = $dbOk && $userQueryOk && $hasUsername && $cacheOk;

    return response()->json([
        'status' => $ready ? 'ok' : 'degraded',
        'service' => 'taghvim-defa-api',
        'checks' => [
            'database' => $dbOk,
            'user_query' => $userQueryOk,
            'users_username_column' => $hasUsername,
            'cache' => $cacheOk,
        ],
        'error' => $error,
    ], $ready ? 200 : 503);
});

Route::prefix('auth')->group(function () {
    // Rate limiting is handled inside AuthController (fail-open if cache is down).
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('/timeline', [TimelineController::class, 'index']);
    Route::get('/timeline/stats', [TimelineController::class, 'stats']);
    Route::get('/timeline/{date}', [TimelineController::class, 'show']);
    Route::get('/my-content', [TimelineController::class, 'myContent']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/settings', [SettingsController::class, 'show']);
    Route::get('/form-schema', [FormSchemaController::class, 'show']);

    Route::get('/days', [CalendarDayController::class, 'index']);
    Route::post('/days', [CalendarDayController::class, 'store']);
    Route::put('/days/{calendarDay}', [CalendarDayController::class, 'update']);
    Route::delete('/days/{calendarDay}', [CalendarDayController::class, 'destroy']);

    Route::post('/days/{calendarDay}/enemy-actions', [CalendarDayController::class, 'storeEnemyAction']);
    Route::post('/days/{calendarDay}/government-actions', [CalendarDayController::class, 'storeGovernmentAction']);
    Route::put('/enemy-actions/{enemyAction}', [CalendarDayController::class, 'updateEnemyAction']);
    Route::put('/government-actions/{governmentAction}', [CalendarDayController::class, 'updateGovernmentAction']);
    Route::delete('/enemy-actions/{enemyAction}', [CalendarDayController::class, 'destroyEnemyAction']);
    Route::delete('/government-actions/{governmentAction}', [CalendarDayController::class, 'destroyGovernmentAction']);
    Route::post('/days/{calendarDay}/media', [CalendarDayController::class, 'uploadMedia']);
    Route::post('/enemy-actions/{enemyAction}/media', [CalendarDayController::class, 'uploadEnemyMedia']);
    Route::post('/government-actions/{governmentAction}/media', [CalendarDayController::class, 'uploadGovernmentMedia']);

    Route::post('/categories', [CategoryController::class, 'store']);

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::get('/users/{user}/permissions', [UserController::class, 'permissions']);

    Route::middleware('permission:view_archive')->group(function () {
        Route::get('/archive', [ArchiveController::class, 'index']);
        Route::post('/archive/{type}/{id}/restore', [ArchiveController::class, 'restore']);
    });

    Route::delete('/archive/{type}/{id}', [ArchiveController::class, 'forceDelete'])
        ->middleware('permission:force_delete');

    Route::middleware('permission:manage_form_schema')->group(function () {
        Route::put('/form-schema', [FormSchemaController::class, 'update']);
    });

    Route::middleware('permission:manage_settings')->group(function () {
        Route::put('/settings', [SettingsController::class, 'update']);
    });

    Route::middleware('permission:run_backup')->group(function () {
        Route::get('/backups', [BackupController::class, 'index']);
        Route::post('/backups', [BackupController::class, 'store']);
        Route::get('/backups/{filename}/download', [BackupController::class, 'download']);
    });
});
