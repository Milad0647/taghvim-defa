<?php

namespace App\Services;

use App\Enums\PublishStatus;
use App\Models\CalendarDay;
use App\Models\EnemyAction;
use App\Models\GovernmentAction;
use App\Models\Media;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;

class CalendarService
{
    public function timeline(?string $from = null, ?string $to = null): array
    {
        $query = CalendarDay::query()
            ->where('status', PublishStatus::Published)
            ->with([
                'media',
                'enemyActions' => fn ($q) => $q->where('status', PublishStatus::Published)->with(['media', 'category']),
                'governmentActions' => fn ($q) => $q->where('status', PublishStatus::Published)->with(['media', 'category']),
            ])
            ->withCount([
                'enemyActions as enemy_actions_count' => fn ($q) => $q->where('status', PublishStatus::Published),
                'governmentActions as government_actions_count' => fn ($q) => $q->where('status', PublishStatus::Published),
            ])
            ->orderBy('date');

        if ($from) {
            $query->whereDate('date', '>=', $from);
        }

        if ($to) {
            $query->whereDate('date', '<=', $to);
        }

        $days = $query->get();
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

    public function findByDate(string $date): ?CalendarDay
    {
        return CalendarDay::query()
            ->whereDate('date', $date)
            ->where('status', PublishStatus::Published)
            ->with([
                'media',
                'enemyActions.media',
                'enemyActions.category',
                'governmentActions.media',
                'governmentActions.category',
                'governmentActions.responseTo',
            ])
            ->withCount(['enemyActions', 'governmentActions'])
            ->first();
    }

    public function createDay(array $data, ?int $userId = null): CalendarDay
    {
        return CalendarDay::create([
            ...$data,
            'created_by' => $userId,
        ]);
    }

    public function createEnemyAction(CalendarDay $day, array $data, ?int $userId = null): EnemyAction
    {
        return $day->enemyActions()->create([
            ...$data,
            'created_by' => $userId,
        ]);
    }

    public function createGovernmentAction(CalendarDay $day, array $data, ?int $userId = null): GovernmentAction
    {
        return $day->governmentActions()->create([
            ...$data,
            'created_by' => $userId,
        ]);
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

    public function dashboardStats(): array
    {
        $enemyTotal = EnemyAction::query()->where('status', PublishStatus::Published)->count();
        $govTotal = GovernmentAction::query()->where('status', PublishStatus::Published)->count();

        $daily = CalendarDay::query()
            ->where('status', PublishStatus::Published)
            ->withCount([
                'enemyActions as enemy_actions_count' => fn ($q) => $q->where('status', PublishStatus::Published),
                'governmentActions as government_actions_count' => fn ($q) => $q->where('status', PublishStatus::Published),
            ])
            ->orderByDesc('date')
            ->limit(30)
            ->get()
            ->map(fn (CalendarDay $day) => [
                'date' => $day->date->toDateString(),
                'enemy' => $day->enemy_actions_count,
                'government' => $day->government_actions_count,
                'score' => $day->activityScore(),
            ])
            ->reverse()
            ->values();

        return [
            'total_enemy_actions' => $enemyTotal,
            'total_government_actions' => $govTotal,
            'response_ratio' => $this->responseRatio($enemyTotal, $govTotal),
            'published_days' => CalendarDay::query()->where('status', PublishStatus::Published)->count(),
            'daily_activity' => $daily,
        ];
    }

    private function responseRatio(int $enemy, int $government): float
    {
        if ($enemy === 0) {
            return $government > 0 ? 100.0 : 0.0;
        }

        return round(min(100, ($government / $enemy) * 100), 1);
    }
}
