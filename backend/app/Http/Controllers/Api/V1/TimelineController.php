<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CalendarDayResource;
use App\Services\CalendarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimelineController extends Controller
{
    public function __construct(private readonly CalendarService $calendarService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $data = $this->calendarService->timeline(
            $request->query('from'),
            $request->query('to'),
        );

        return response()->json([
            'data' => CalendarDayResource::collection($data['days']),
            'meta' => [
                'max_activity_score' => $data['max_activity_score'],
                'stats' => $data['stats'],
            ],
        ]);
    }

    public function show(string $date): JsonResponse
    {
        $day = $this->calendarService->findByDate($date);

        if (! $day) {
            return response()->json(['message' => 'Day not found'], 404);
        }

        return response()->json([
            'data' => new CalendarDayResource($day),
        ]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'data' => $this->calendarService->dashboardStats(),
        ]);
    }
}
