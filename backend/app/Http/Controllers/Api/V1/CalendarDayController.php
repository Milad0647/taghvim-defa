<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PublishStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CalendarDayResource;
use App\Http\Resources\EnemyActionResource;
use App\Http\Resources\GovernmentActionResource;
use App\Http\Resources\MediaResource;
use App\Models\CalendarDay;
use App\Models\EnemyAction;
use App\Models\GovernmentAction;
use App\Services\CalendarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CalendarDayController extends Controller
{
    public function __construct(private readonly CalendarService $calendarService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $days = CalendarDay::query()
            ->withCount(['enemyActions', 'governmentActions'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('date')
            ->paginate(30);

        return CalendarDayResource::collection($days)->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date', 'unique:calendar_days,date'],
            'title' => ['nullable', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'status' => ['nullable', Rule::enum(PublishStatus::class)],
            'is_featured' => ['boolean'],
        ]);

        $day = $this->calendarService->createDay($data, $request->user()?->id);

        return response()->json([
            'data' => new CalendarDayResource($day),
        ], 201);
    }

    public function update(Request $request, CalendarDay $calendarDay): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'summary' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', Rule::enum(PublishStatus::class)],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        $calendarDay->update($data);

        return response()->json([
            'data' => new CalendarDayResource($calendarDay->fresh()->loadCount(['enemyActions', 'governmentActions'])),
        ]);
    }

    public function destroy(CalendarDay $calendarDay): JsonResponse
    {
        $calendarDay->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function storeEnemyAction(Request $request, CalendarDay $calendarDay): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'severity' => ['nullable', 'in:low,medium,high,critical'],
            'source' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'occurred_at' => ['nullable', 'date'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'status' => ['nullable', Rule::enum(PublishStatus::class)],
        ]);

        $action = $this->calendarService->createEnemyAction($calendarDay, $data, $request->user()?->id);
        $action->load(['media', 'category']);

        return response()->json([
            'data' => new EnemyActionResource($action),
        ], 201);
    }

    public function storeGovernmentAction(Request $request, CalendarDay $calendarDay): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'agency' => ['nullable', 'string', 'max:255'],
            'completed_at' => ['nullable', 'date'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'response_to_id' => ['nullable', 'exists:enemy_actions,id'],
            'status' => ['nullable', Rule::enum(PublishStatus::class)],
        ]);

        $action = $this->calendarService->createGovernmentAction($calendarDay, $data, $request->user()?->id);
        $action->load(['media', 'category', 'responseTo']);

        return response()->json([
            'data' => new GovernmentActionResource($action),
        ], 201);
    }

    public function uploadMedia(Request $request, CalendarDay $calendarDay): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:10240'],
            'alt' => ['nullable', 'string', 'max:255'],
        ]);

        $media = $this->calendarService->attachMedia(
            $calendarDay,
            $request->file('file'),
            $request->input('alt'),
        );

        return response()->json([
            'data' => new MediaResource($media),
        ], 201);
    }

    public function uploadEnemyMedia(Request $request, EnemyAction $enemyAction): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:10240'],
            'alt' => ['nullable', 'string', 'max:255'],
        ]);

        $media = $this->calendarService->attachMedia(
            $enemyAction,
            $request->file('file'),
            $request->input('alt'),
        );

        return response()->json([
            'data' => new MediaResource($media),
        ], 201);
    }

    public function uploadGovernmentMedia(Request $request, GovernmentAction $governmentAction): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:10240'],
            'alt' => ['nullable', 'string', 'max:255'],
        ]);

        $media = $this->calendarService->attachMedia(
            $governmentAction,
            $request->file('file'),
            $request->input('alt'),
        );

        return response()->json([
            'data' => new MediaResource($media),
        ], 201);
    }
}
