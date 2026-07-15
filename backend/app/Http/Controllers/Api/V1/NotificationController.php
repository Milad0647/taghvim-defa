<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = $user->notifications()->latest();

        $status = $request->query('status', 'all');
        if ($status === 'unread') {
            $query->whereNull('read_at');
        } elseif ($status === 'read') {
            $query->whereNotNull('read_at');
        }

        $category = $request->query('category');
        if (is_string($category) && $category !== '' && $category !== 'all') {
            $query->where('data->category', $category);
        }

        $kind = $request->query('kind');
        if (is_string($kind) && in_array($kind, ['enemy', 'government'], true)) {
            $query->where('data->kind', $kind);
        }

        $search = trim((string) $request->query('q', ''));
        if ($search !== '') {
            $like = '%'.mb_strtolower($search).'%';
            $query->whereRaw('LOWER(CAST(data AS TEXT)) LIKE ?', [$like]);
        }

        $perPage = min(50, max(1, (int) $request->query('per_page', 30)));
        $page = $query->paginate($perPage);

        return response()->json([
            'data' => collect($page->items())->map(fn (DatabaseNotification $n) => $this->transform($n)),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        /** @var DatabaseNotification|null $notification */
        $notification = $request->user()->notifications()->where('id', $id)->first();

        if (! $notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return response()->json([
            'data' => $this->transform($notification->fresh()),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'All notifications marked as read',
            'data' => [
                'unread_count' => 0,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(?DatabaseNotification $notification): array
    {
        if (! $notification) {
            return [];
        }

        $data = is_array($notification->data) ? $notification->data : [];

        return [
            'id' => $notification->id,
            'type' => class_basename($notification->type),
            'category' => $data['category'] ?? null,
            'kind' => $data['kind'] ?? null,
            'action_id' => $data['action_id'] ?? null,
            'title' => $data['title'] ?? null,
            'actor_id' => $data['actor_id'] ?? null,
            'actor_name' => $data['actor_name'] ?? null,
            'date' => $data['date'] ?? null,
            'message' => $data['message'] ?? null,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
            'is_read' => $notification->read_at !== null,
        ];
    }
}
