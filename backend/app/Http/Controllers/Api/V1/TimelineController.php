<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CalendarDayResource;
use App\Http\Resources\EnemyActionResource;
use App\Http\Resources\GovernmentActionResource;
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
        $user = $request->user();

        $data = $this->calendarService->timeline(
            $request->query('from'),
            $request->query('to'),
            $user,
        );

        return response()->json([
            'data' => CalendarDayResource::collection($data['days']),
            'meta' => [
                'max_activity_score' => $data['max_activity_score'],
                'stats' => $data['stats'],
            ],
        ]);
    }

    public function show(Request $request, string $date): JsonResponse
    {
        $user = $request->user();

        $day = $this->calendarService->findByDate($date, $user);

        if (! $day) {
            return response()->json(['message' => 'Day not found'], 404);
        }

        return response()->json([
            'data' => new CalendarDayResource($day),
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => $this->calendarService->dashboardStats($user),
        ]);
    }

    public function myContent(Request $request): JsonResponse
    {
        $data = $this->calendarService->myContent($request->user());

        return response()->json([
            'data' => [
                'enemy_actions' => EnemyActionResource::collection($data['enemy_actions']),
                'government_actions' => GovernmentActionResource::collection($data['government_actions']),
            ],
        ]);
    }
}
