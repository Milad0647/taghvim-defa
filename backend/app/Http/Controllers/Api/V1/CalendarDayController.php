<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreCalendarDayRequest;
use App\Http\Requests\Api\V1\StoreEnemyActionRequest;
use App\Http\Requests\Api\V1\StoreGovernmentActionRequest;
use App\Http\Requests\Api\V1\UpdateCalendarDayRequest;
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

class CalendarDayController extends Controller
{
    public function __construct(private readonly CalendarService $calendarService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', CalendarDay::class);

        $viewer = $request->user();
        $days = CalendarDay::query()
            ->withCount(['enemyActions', 'governmentActions'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when(
                $viewer && ($ids = $viewer->visibleCreatorIds()) !== null,
                fn ($q) => $q->where(function ($inner) use ($ids) {
                    $inner->whereIn('created_by', $ids)
                        ->orWhereHas('enemyActions', fn ($e) => $e->whereIn('created_by', $ids))
                        ->orWhereHas('governmentActions', fn ($g) => $g->whereIn('created_by', $ids));
                }),
            )
            ->orderByDesc('date')
            ->paginate(30);

        return CalendarDayResource::collection($days)->response();
    }

    public function store(StoreCalendarDayRequest $request): JsonResponse
    {
        $day = $this->calendarService->createDay($request->validated(), $request->user()?->id);

        return response()->json([
            'data' => new CalendarDayResource($day),
        ], 201);
    }

    public function update(UpdateCalendarDayRequest $request, CalendarDay $calendarDay): JsonResponse
    {
        $calendarDay->update($request->validated());

        return response()->json([
            'data' => new CalendarDayResource($calendarDay->fresh()->loadCount(['enemyActions', 'governmentActions'])),
        ]);
    }

    public function destroy(Request $request, CalendarDay $calendarDay): JsonResponse
    {
        $this->authorize('delete', $calendarDay);
        $calendarDay->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function storeEnemyAction(StoreEnemyActionRequest $request, CalendarDay $calendarDay): JsonResponse
    {
        $this->authorize('view', $calendarDay);

        $action = $this->calendarService->createEnemyAction(
            $calendarDay,
            $request->validated(),
            $request->user(),
        );
        $action->load(['media', 'category']);

        return response()->json([
            'data' => new EnemyActionResource($action),
        ], 201);
    }

    public function storeGovernmentAction(StoreGovernmentActionRequest $request, CalendarDay $calendarDay): JsonResponse
    {
        $this->authorize('view', $calendarDay);

        $action = $this->calendarService->createGovernmentAction(
            $calendarDay,
            $request->validated(),
            $request->user(),
        );
        $action->load(['media', 'category', 'responseTo']);

        return response()->json([
            'data' => new GovernmentActionResource($action),
        ], 201);
    }

    public function uploadMedia(Request $request, CalendarDay $calendarDay): JsonResponse
    {
        $this->authorize('update', $calendarDay);

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
        $this->authorize('update', $enemyAction);

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
        $this->authorize('update', $governmentAction);

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

    public function destroyEnemyAction(Request $request, EnemyAction $enemyAction): JsonResponse
    {
        $this->authorize('delete', $enemyAction);
        $enemyAction->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function destroyGovernmentAction(Request $request, GovernmentAction $governmentAction): JsonResponse
    {
        $this->authorize('delete', $governmentAction);
        $governmentAction->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
