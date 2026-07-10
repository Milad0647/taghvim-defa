<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DashboardSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    private const KEY = 'dashboard';

    public function show(): JsonResponse
    {
        $setting = DashboardSetting::query()->where('key', self::KEY)->first();

        return response()->json([
            'data' => $setting?->value ?? $this->defaults(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        /** @var \App\Models\User|null $user */
        $user = $request->user();
        if (! $user || ! $user->isAdmin()) {
            abort(403, 'Only super admins can update settings.');
        }

        $data = $request->validate([
            'rangeStart' => ['nullable', 'string', 'max:32'],
            'rangeEnd' => ['nullable', 'string', 'max:32'],
            'siteTitle' => ['nullable', 'string', 'max:255'],
            'liveEnabled' => ['boolean'],
            'defaultView' => ['nullable', 'in:timeline,week,month'],
            'showEnemySection' => ['boolean'],
            'showGovernmentSection' => ['boolean'],
            'timezoneLabel' => ['nullable', 'string', 'max:64'],
        ]);

        foreach (['rangeStart', 'rangeEnd'] as $dateKey) {
            if (array_key_exists($dateKey, $data) && $data[$dateKey] === '') {
                $data[$dateKey] = null;
            }
        }

        $current = DashboardSetting::query()->where('key', self::KEY)->first();
        $merged = array_merge($this->defaults(), $current?->value ?? [], $data);

        $setting = DashboardSetting::query()->updateOrCreate(
            ['key' => self::KEY],
            ['value' => $merged],
        );

        return response()->json([
            'data' => $setting->value,
        ]);
    }

    private function defaults(): array
    {
        return [
            'rangeStart' => null,
            'rangeEnd' => null,
            'siteTitle' => 'تقویم دفاعی',
            'liveEnabled' => true,
            'defaultView' => 'timeline',
            'showEnemySection' => true,
            'showGovernmentSection' => true,
            'timezoneLabel' => 'Asia/Tehran',
        ];
    }
}
