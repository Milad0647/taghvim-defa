<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DemoDataService;
use App\Services\SecurityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class DemoDataController extends Controller
{
    public function __construct(private readonly DemoDataService $demoDataService)
    {
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'data' => $this->demoDataService->stats(),
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        try {
            $result = $this->demoDataService->clear();
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }

        SecurityLog::info('demo_data.cleared', [
            'actor_id' => $request->user()?->id,
            'days' => $result['days'],
            'events' => $result['events'],
            'media' => $result['media'],
        ]);

        return response()->json([
            'message' => 'همه داده‌های خبری نمونه از سرور پاک شد.',
            'data' => $result,
        ]);
    }

    public function restore(Request $request): JsonResponse
    {
        try {
            $result = $this->demoDataService->restore();
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }

        SecurityLog::info('demo_data.restored', [
            'actor_id' => $request->user()?->id,
            'days' => $result['days'],
            'events' => $result['events'],
            'media_attached' => $result['media_attached'],
        ]);

        return response()->json([
            'message' => 'داده خبری نمونه با تصاویر جدید بازیابی شد.',
            'data' => $result,
        ]);
    }
}
