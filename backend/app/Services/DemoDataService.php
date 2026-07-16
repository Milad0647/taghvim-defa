<?php

namespace App\Services;

use App\Models\CalendarDay;
use App\Models\EnemyAction;
use App\Models\GovernmentAction;
use App\Models\Media;
use Database\Seeders\ConflictMediaSeeder;
use Database\Seeders\DemoContentSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class DemoDataService
{
    /**
     * @return array{days: int, events: int, media: int}
     */
    public function clear(): array
    {
        $counts = ['days' => 0, 'events' => 0, 'media' => 0];

        DB::transaction(function () use (&$counts): void {
            $counts['media'] = $this->deleteAllMediaFiles();

            $enemyCount = EnemyAction::withTrashed()->count();
            $govCount = GovernmentAction::withTrashed()->count();
            $counts['events'] = $enemyCount + $govCount;

            EnemyAction::withTrashed()->get()->each->forceDelete();
            GovernmentAction::withTrashed()->get()->each->forceDelete();

            $counts['days'] = CalendarDay::withTrashed()->count();
            CalendarDay::withTrashed()->get()->each->forceDelete();
        });

        return $counts;
    }

    /**
     * @return array{days: int, events: int, media_attached: int}
     */
    public function restore(): array
    {
        $contentSeeder = new DemoContentSeeder;
        $contentSeeder->run();

        $mediaSeeder = new ConflictMediaSeeder;
        $mediaSeeder->run(force: true);

        $stats = $this->stats();

        return [
            'days' => $stats['days'],
            'events' => $stats['events'],
            'media_attached' => Media::query()
                ->whereIn('attachable_type', [
                    (new EnemyAction)->getMorphClass(),
                    (new GovernmentAction)->getMorphClass(),
                ])
                ->count(),
        ];
    }

    /**
     * @return array{days: int, events: int, cleared: bool}
     */
    public function stats(): array
    {
        $enemyCount = EnemyAction::query()->count();
        $govCount = GovernmentAction::query()->count();
        $days = CalendarDay::query()->count();

        return [
            'days' => $days,
            'events' => $enemyCount + $govCount,
            'cleared' => $days === 0,
        ];
    }

    private function deleteAllMediaFiles(): int
    {
        $deleted = 0;

        Media::query()->orderBy('id')->chunkById(100, function ($items) use (&$deleted): void {
            foreach ($items as $media) {
                try {
                    Storage::disk($media->disk)->delete($media->path);
                } catch (Throwable) {
                    // Continue even if the file is already gone.
                }

                $media->delete();
                $deleted++;
            }
        });

        return $deleted;
    }

    public function deleteMediaForModel(Model $model): void
    {
        $model->media()->get()->each(function (Media $media): void {
            try {
                Storage::disk($media->disk)->delete($media->path);
            } catch (Throwable) {
                // Continue even if the file is already gone.
            }

            $media->delete();
        });
    }
}
