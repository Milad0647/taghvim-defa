<?php

namespace Database\Seeders;

use App\Models\EnemyAction;
use App\Models\GovernmentAction;
use App\Models\Media;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Attaches bundled conflict imagery from database/seeders/assets/conflict only.
 */
class ConflictMediaSeeder extends Seeder
{
    private const BUNDLED_DIR = 'seeders/assets/conflict';

    private const SEED_STORAGE_DIR = 'uploads/seed';

    public function run(bool $force = false): void
    {
        if ($force) {
            $this->purgeSeedStorageCache();
        }

        $sourceFiles = $this->loadBundledAssets();
        if ($sourceFiles === []) {
            $this->command?->warn('ConflictMediaSeeder: no bundled images found; skipped.');

            return;
        }

        $actions = collect()
            ->merge(EnemyAction::query()->orderBy('id')->get())
            ->merge(GovernmentAction::query()->orderBy('id')->get());

        $index = 0;
        $attached = 0;

        foreach ($actions as $action) {
            /** @var Model $action */
            if ($action->media()->exists()) {
                if (! $force) {
                    continue;
                }

                $this->clearActionMedia($action);
            }

            $file = $sourceFiles[$index % count($sourceFiles)];
            $index++;

            $this->attachFile($action, $file['path'], $file['alt'], $file['mime']);
            $attached++;
        }

        $this->command?->info('ConflictMediaSeeder: using '.count($sourceFiles).' bundled image(s).');
        $this->command?->info("ConflictMediaSeeder: attached media to {$attached} actions.");
    }

    /**
     * @return list<array{path: string, alt: string, mime: string}>
     */
    private function loadBundledAssets(): array
    {
        $directory = database_path(self::BUNDLED_DIR);
        if (! is_dir($directory)) {
            return [];
        }

        $paths = array_merge(
            glob($directory.'/*.jpg') ?: [],
            glob($directory.'/*.jpeg') ?: [],
            glob($directory.'/*.JPG') ?: [],
            glob($directory.'/*.JPEG') ?: [],
            glob($directory.'/*.png') ?: [],
            glob($directory.'/*.PNG') ?: [],
            glob($directory.'/*.webp') ?: [],
            glob($directory.'/*.WEBP') ?: [],
        );

        if ($paths === []) {
            return [];
        }

        natcasesort($paths);

        Storage::disk('public')->makeDirectory(self::SEED_STORAGE_DIR);
        $files = [];

        foreach (array_values($paths) as $absolute) {
            if (! is_file($absolute)) {
                continue;
            }

            $sanitized = $this->sanitizeFilename(basename($absolute));
            $relative = self::SEED_STORAGE_DIR.'/'.$sanitized;

            $contents = file_get_contents($absolute);
            if ($contents === false) {
                Log::warning('ConflictMediaSeeder bundled read failed', ['path' => $absolute]);

                continue;
            }

            Storage::disk('public')->put($relative, $contents);

            $storageAbsolute = Storage::disk('public')->path($relative);
            if (! is_file($storageAbsolute)) {
                continue;
            }

            $mime = mime_content_type($storageAbsolute) ?: 'image/jpeg';
            if (! str_starts_with($mime, 'image/')) {
                continue;
            }

            $files[] = [
                'path' => $relative,
                'alt' => 'Conflict imagery (seed asset)',
                'mime' => $mime,
            ];
        }

        return $files;
    }

    private function purgeSeedStorageCache(): void
    {
        if (! Storage::disk('public')->exists(self::SEED_STORAGE_DIR)) {
            return;
        }

        foreach (Storage::disk('public')->allFiles(self::SEED_STORAGE_DIR) as $relative) {
            Storage::disk('public')->delete($relative);
        }
    }

    private function sanitizeFilename(string $filename): string
    {
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION) ?: 'jpg');
        $basename = pathinfo($filename, PATHINFO_FILENAME);
        $basename = preg_replace('/\s*\((\d+)\)\s*/', '-$1', $basename) ?? $basename;
        $basename = Str::slug($basename, '-');

        if ($basename === '') {
            $basename = 'image';
        }

        return $basename.'.'.$extension;
    }

    private function clearActionMedia(Model $model): void
    {
        $model->media()->each(function (Media $media): void {
            Storage::disk($media->disk)->delete($media->path);
            $media->delete();
        });
    }

    private function attachFile(Model $model, string $relativePath, string $alt, string $mime): void
    {
        $uniqueName = Str::uuid()->toString().'_'.basename($relativePath);
        $dest = 'uploads/'.now()->format('Y/m').'/'.$uniqueName;

        Storage::disk('public')->copy($relativePath, $dest);

        Media::query()->create([
            'attachable_type' => $model->getMorphClass(),
            'attachable_id' => $model->getKey(),
            'path' => $dest,
            'disk' => 'public',
            'mime_type' => $mime,
            'size' => Storage::disk('public')->size($dest),
            'alt' => $alt,
            'sort_order' => 0,
        ]);
    }
}
