<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Models\CalendarDay;
use App\Models\EnemyAction;
use App\Models\GovernmentAction;
use App\Models\User;
use App\Services\SecurityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArchiveController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->hasPermission(Permission::ViewArchive)) {
            abort(403, 'Archive access required.');
        }

        $type = $request->query('type', 'all');
        $ids = $user->visibleCreatorIds();
        $items = [];

        if ($type === 'all' || $type === 'calendar_days') {
            $q = CalendarDay::onlyTrashed()->orderByDesc('deleted_at');
            if ($ids !== null) {
                $q->whereIn('created_by', $ids);
            }
            foreach ($q->limit(100)->get() as $row) {
                $items[] = $this->serialize('calendar_days', $row);
            }
        }

        if ($type === 'all' || $type === 'enemy_actions') {
            $q = EnemyAction::onlyTrashed()->orderByDesc('deleted_at');
            if ($ids !== null) {
                $q->whereIn('created_by', $ids);
            }
            foreach ($q->limit(100)->get() as $row) {
                $items[] = $this->serialize('enemy_actions', $row);
            }
        }

        if ($type === 'all' || $type === 'government_actions') {
            $q = GovernmentAction::onlyTrashed()->orderByDesc('deleted_at');
            if ($ids !== null) {
                $q->whereIn('created_by', $ids);
            }
            foreach ($q->limit(100)->get() as $row) {
                $items[] = $this->serialize('government_actions', $row);
            }
        }

        usort($items, fn ($a, $b) => strcmp($b['deleted_at'] ?? '', $a['deleted_at'] ?? ''));

        return response()->json(['data' => $items]);
    }

    public function restore(Request $request, string $type, int $id): JsonResponse
    {
        $model = $this->resolveTrashed($type, $id);
        $this->authorize('restore', $model);
        $model->restore();

        SecurityLog::info('archive.restore', [
            'actor_id' => $request->user()?->id,
            'type' => $type,
            'id' => $id,
        ]);

        return response()->json(['message' => 'Restored', 'data' => $this->serialize($type, $model->fresh())]);
    }

    public function forceDelete(Request $request, string $type, int $id): JsonResponse
    {
        $model = $this->resolveTrashed($type, $id);
        $this->authorize('forceDelete', $model);
        $model->forceDelete();

        SecurityLog::warning('archive.force_delete', [
            'actor_id' => $request->user()?->id,
            'type' => $type,
            'id' => $id,
        ]);

        return response()->json(['message' => 'Permanently deleted']);
    }

    private function resolveTrashed(string $type, int $id): Model
    {
        $model = match ($type) {
            'calendar_days' => CalendarDay::onlyTrashed()->find($id),
            'enemy_actions' => EnemyAction::onlyTrashed()->find($id),
            'government_actions' => GovernmentAction::onlyTrashed()->find($id),
            default => null,
        };

        if (! $model) {
            abort(404, 'Archived item not found.');
        }

        return $model;
    }

    private function serialize(string $type, Model $model): array
    {
        return [
            'type' => $type,
            'id' => $model->id,
            'title' => $model->title ?? null,
            'created_by' => $model->created_by ?? null,
            'deleted_at' => $model->deleted_at?->toIso8601String(),
            'date' => isset($model->date) ? (string) $model->date : null,
        ];
    }
}
