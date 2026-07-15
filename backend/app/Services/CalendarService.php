<?php

namespace App\Services;

use App\Enums\PublishStatus;
use App\Enums\UserRole;
use App\Models\CalendarDay;
use App\Models\EnemyAction;
use App\Models\GovernmentAction;
use App\Models\Media;
use App\Models\User;
use App\Notifications\ContentPublishedNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;

class CalendarService
{
    public function timeline(?string $from = null, ?string $to = null, ?User $viewer = null): array
    {
        $query = CalendarDay::query()
            ->where('status', PublishStatus::Published)
            ->with([
                'media',
                'enemyActions' => function ($q) use ($viewer) {
                    $q->where('status', PublishStatus::Published)->with(['media', 'category', 'creator:id,name']);
                    $this->scopeCreatedBy($q, $viewer);
                },
                'governmentActions' => function ($q) use ($viewer) {
                    $q->where('status', PublishStatus::Published)->with(['media', 'category', 'creator:id,name']);
                    $this->scopeCreatedBy($q, $viewer);
                },
            ])
            ->withCount([
                'enemyActions as enemy_actions_count' => function ($q) use ($viewer) {
                    $q->where('status', PublishStatus::Published);
                    $this->scopeCreatedBy($q, $viewer);
                },
                'governmentActions as government_actions_count' => function ($q) use ($viewer) {
                    $q->where('status', PublishStatus::Published);
                    $this->scopeCreatedBy($q, $viewer);
                },
            ])
            ->orderBy('date');

        $this->scopeDayVisibility($query, $viewer);

        if ($from) {
            $query->whereDate('date', '>=', $from);
        }

        if ($to) {
            $query->whereDate('date', '<=', $to);
        }

        $days = $query->get()->filter(function (CalendarDay $day) {
            return ($day->enemy_actions_count ?? 0) > 0
                || ($day->government_actions_count ?? 0) > 0
                || $day->created_by !== null;
        })->values();

        $maxScore = max(1, (int) $days->max(fn (CalendarDay $day) => $day->activityScore()));

        return [
            'days' => $days,
            'max_activity_score' => $maxScore,
            'stats' => [
                'total_days' => $days->count(),
                'total_enemy_actions' => (int) $days->sum('enemy_actions_count'),
                'total_government_actions' => (int) $days->sum('government_actions_count'),
                'response_ratio' => $this->responseRatio(
                    (int) $days->sum('enemy_actions_count'),
                    (int) $days->sum('government_actions_count'),
                ),
            ],
        ];
    }

    public function findByDate(string $date, ?User $viewer = null): ?CalendarDay
    {
        $query = CalendarDay::query()
            ->whereDate('date', $date)
            ->where('status', PublishStatus::Published)
            ->with([
                'media',
                'enemyActions' => function ($q) use ($viewer) {
                    $q->with(['media', 'category']);
                    $this->scopeCreatedBy($q, $viewer);
                },
                'governmentActions' => function ($q) use ($viewer) {
                    $q->with(['media', 'category', 'responseTo']);
                    $this->scopeCreatedBy($q, $viewer);
                },
            ])
            ->withCount([
                'enemyActions' => fn ($q) => $this->scopeCreatedBy($q, $viewer),
                'governmentActions' => fn ($q) => $this->scopeCreatedBy($q, $viewer),
            ]);

        $this->scopeDayVisibility($query, $viewer);

        return $query->first();
    }

    public function myContent(User $viewer): array
    {
        $ids = $viewer->visibleCreatorIds() ?? $viewer->descendantIdsIncludingSelf();

        $enemy = EnemyAction::query()
            ->with(['media', 'category', 'calendarDay', 'creator:id,name'])
            ->whereIn('created_by', $ids)
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->get();

        $government = GovernmentAction::query()
            ->with(['media', 'category', 'calendarDay', 'responseTo', 'creator:id,name'])
            ->whereIn('created_by', $ids)
            ->orderByDesc('completed_at')
            ->orderByDesc('id')
            ->get();

        return [
            'enemy_actions' => $enemy,
            'government_actions' => $government,
        ];
    }

    public function createDay(array $data, ?int $userId = null): CalendarDay
    {
        return CalendarDay::create([
            ...$data,
            'created_by' => $userId,
        ]);
    }

    public function createEnemyAction(CalendarDay $day, array $data, ?User $actor = null): EnemyAction
    {
        unset($data['agency_id']);
        $data['agency_id'] = null;

        $action = $day->enemyActions()->create([
            ...$data,
            'created_by' => $actor?->id,
        ]);

        $this->notifyContentCreated($actor, 'enemy', $action, $day);

        return $action;
    }

    public function createGovernmentAction(CalendarDay $day, array $data, ?User $actor = null): GovernmentAction
    {
        $data = $this->withResolvedAgencyId($data, $actor, requireAgency: true);

        $action = $day->governmentActions()->create([
            ...$data,
            'created_by' => $actor?->id,
        ]);

        $this->notifyContentCreated($actor, 'government', $action, $day);

        return $action;
    }

    /**
     * Notify admins (all content) and ancestors (subordinate content).
     */
    public function notifyContentCreated(
        ?User $actor,
        string $kind,
        EnemyAction|GovernmentAction $action,
        ?CalendarDay $day = null,
    ): void
    {
        if (! $actor) {
            return;
        }

        $recipientIds = array_values(array_unique([
            ...User::query()
                ->where('role', UserRole::SuperAdmin)
                ->where('is_active', true)
                ->where('id', '!=', $actor->id)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all(),
            ...$actor->ancestorIds(),
        ]));

        $recipientIds = array_values(array_filter(
            $recipientIds,
            fn (int $id) => $id !== (int) $actor->id,
        ));

        if ($recipientIds === []) {
            return;
        }

        $recipients = User::query()
            ->whereIn('id', $recipientIds)
            ->where('is_active', true)
            ->get();

        if ($recipients->isEmpty()) {
            return;
        }

        $date = null;
        if ($action instanceof EnemyAction) {
            $date = $action->occurred_at?->toDateString()
                ?? $day?->date?->toDateString();
        } else {
            $date = $action->completed_at?->toDateString()
                ?? $day?->date?->toDateString();
        }

        Notification::send(
            $recipients,
            new ContentPublishedNotification(
                kind: $kind,
                actionId: (int) $action->id,
                title: (string) $action->title,
                actorId: (int) $actor->id,
                actorName: (string) $actor->name,
                date: $date,
            ),
        );
    }

    /**
     * Bind government content to a ministry the actor is allowed to use.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function withResolvedAgencyId(array $data, ?User $actor, bool $requireAgency = true): array
    {
        if (! $requireAgency) {
            $data['agency_id'] = null;

            return $data;
        }

        $requested = isset($data['agency_id']) ? trim((string) $data['agency_id']) : '';
        $requested = $requested !== '' ? $requested : null;
        $allowed = array_values(array_map('strval', $actor?->agency_ids ?? []));
        $isAdmin = $actor?->isAdmin() ?? false;

        if ($requested === null) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'agency_id' => ['انتخاب وزارتخانه برای اقدام دولت الزامی است.'],
            ]);
        }

        if ($isAdmin) {
            $data['agency_id'] = $requested;

            return $data;
        }

        if ($allowed === []) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'agency_id' => ['برای حساب شما وزارتخانه‌ای تعریف نشده است.'],
            ]);
        }

        if (! in_array($requested, $allowed, true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'agency_id' => ['فقط وزارتخانه‌های مجاز خودتان را می‌توانید انتخاب کنید.'],
            ]);
        }

        $data['agency_id'] = $requested;

        return $data;
    }

    public function attachMedia(Model $model, UploadedFile $file, ?string $alt = null): Media
    {
        $path = $file->store('uploads/'.now()->format('Y/m'), 'public');

        /** @var Media $media */
        $media = $model->media()->create([
            'path' => $path,
            'disk' => 'public',
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize() ?: 0,
            'alt' => $alt,
        ]);

        return $media;
    }

    public function dashboardStats(?User $viewer = null): array
    {
        $enemyQuery = EnemyAction::query()->where('status', PublishStatus::Published);
        $govQuery = GovernmentAction::query()->where('status', PublishStatus::Published);
        $this->scopeCreatedBy($enemyQuery, $viewer);
        $this->scopeCreatedBy($govQuery, $viewer);

        $enemyTotal = $enemyQuery->count();
        $govTotal = $govQuery->count();

        $daysQuery = CalendarDay::query()
            ->where('status', PublishStatus::Published)
            ->withCount([
                'enemyActions as enemy_actions_count' => function ($q) use ($viewer) {
                    $q->where('status', PublishStatus::Published);
                    $this->scopeCreatedBy($q, $viewer);
                },
                'governmentActions as government_actions_count' => function ($q) use ($viewer) {
                    $q->where('status', PublishStatus::Published);
                    $this->scopeCreatedBy($q, $viewer);
                },
            ])
            ->orderByDesc('date')
            ->limit(30);

        $this->scopeDayVisibility($daysQuery, $viewer);

        $daily = $daysQuery->get()
            ->map(fn (CalendarDay $day) => [
                'date' => $day->date->toDateString(),
                'enemy' => $day->enemy_actions_count,
                'government' => $day->government_actions_count,
                'score' => $day->activityScore(),
            ])
            ->reverse()
            ->values();

        $publishedDays = CalendarDay::query()->where('status', PublishStatus::Published);
        $this->scopeDayVisibility($publishedDays, $viewer);

        return [
            'total_enemy_actions' => $enemyTotal,
            'total_government_actions' => $govTotal,
            'response_ratio' => $this->responseRatio($enemyTotal, $govTotal),
            'published_days' => $publishedDays->count(),
            'daily_activity' => $daily,
        ];
    }

    private function scopeCreatedBy(Builder $query, ?User $viewer): void
    {
        if (! $viewer) {
            return;
        }

        $ids = $viewer->visibleCreatorIds();
        if ($ids === null) {
            return;
        }

        $query->whereIn('created_by', $ids);
    }

    private function scopeDayVisibility(Builder $query, ?User $viewer): void
    {
        if (! $viewer) {
            return;
        }

        $ids = $viewer->visibleCreatorIds();
        if ($ids === null) {
            return;
        }

        $query->where(function (Builder $q) use ($ids) {
            $q->whereIn('created_by', $ids)
                ->orWhereHas('enemyActions', fn (Builder $e) => $e->whereIn('created_by', $ids))
                ->orWhereHas('governmentActions', fn (Builder $g) => $g->whereIn('created_by', $ids));
        });
    }

    private function responseRatio(int $enemy, int $government): float
    {
        if ($enemy === 0) {
            return $government > 0 ? 100.0 : 0.0;
        }

        return round(min(100, ($government / $enemy) * 100), 1);
    }
}
