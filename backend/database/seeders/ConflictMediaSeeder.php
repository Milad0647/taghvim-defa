<?php

namespace Database\Seeders;

use App\Models\EnemyAction;
use App\Models\GovernmentAction;
use App\Models\Media;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Attaches bundled conflict imagery (database/seeders/assets/conflict) to seeded actions.
 * Wikimedia Commons sources are used only when no bundled assets are present.
 */
class ConflictMediaSeeder extends Seeder
{
    private const BUNDLED_DIR = 'seeders/assets/conflict';

    private const SEED_STORAGE_DIR = 'uploads/seed';

    /**
     * Freely licensed fallback sources (used only when bundled assets are missing).
     *
     * @var list<array{url: string, alt: string, filename: string}>
     */
    private array $commonsSources = [
        [
            'url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Pictures_of_the_Israel_attack_on_Tehran_1_Mehr.jpg?width=1280',
            'alt' => 'CC BY 4.0 — Mehr News Agency via Wikimedia Commons',
            'filename' => 'tehran-mehr-1.jpg',
        ],
        [
            'url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Pictures_of_the_Israeli_attack_on_Tehran_1_Mehr_(2).jpg?width=1280',
            'alt' => 'CC BY 4.0 — Mehr News Agency via Wikimedia Commons',
            'filename' => 'tehran-mehr-2.jpg',
        ],
        [
            'url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/119103_remnants_of_an_iranian_ballistic_missile_october_2_PikiWiki_Israel.jpg?width=1280',
            'alt' => 'CC BY 2.5 — PikiWiki / Zeev Stein via Wikimedia Commons',
            'filename' => 'missile-remnant-pikiwiki.jpg',
        ],
        [
            'url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Israeli_Air_Force_fighter_jets_on_their_way_to_attack_Iran,_June_2025._I.jpg?width=1280',
            'alt' => 'CC BY-SA — IDF Spokesperson via Wikimedia Commons',
            'filename' => 'iaf-june-2025-1.jpg',
        ],
        [
            'url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Map_of_Iran_Israel_conflict.jpg',
            'alt' => 'CC0 — Map of regional conflict via Wikimedia Commons',
            'filename' => 'conflict-map.jpg',
        ],
        [
            'url' => 'https://commons.wikimedia.org/wiki/Special:FilePath/Israeli_Air_Force_fighter_jets_on_their_way_to_attack_Iran,_June_2025._II.jpg?width=1280',
            'alt' => 'CC BY-SA — IDF Spokesperson via Wikimedia Commons',
            'filename' => 'iaf-june-2025-2.jpg',
        ],
    ];

    public function run(bool $force = false): void
    {
        $sourceFiles = $this->resolveSourceFiles();
        if ($sourceFiles === []) {
            $this->command?->warn('ConflictMediaSeeder: no images available; skipped.');

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

        $this->command?->info("ConflictMediaSeeder: attached media to {$attached} actions.");
    }

    /**
     * @return list<array{path: string, alt: string, mime: string}>
     */
    private function resolveSourceFiles(): array
    {
        $bundled = $this->loadBundledAssets();
        if ($bundled !== []) {
            $this->command?->info('ConflictMediaSeeder: using '.count($bundled).' bundled image(s).');

            return $bundled;
        }

        $this->command?->warn('ConflictMediaSeeder: no bundled assets; falling back to Wikimedia Commons.');

        return $this->downloadCommonsSources();
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
        if ($paths === false || $paths === []) {
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

            if (! Storage::disk('public')->exists($relative)) {
                $contents = file_get_contents($absolute);
                if ($contents === false) {
                    Log::warning('ConflictMediaSeeder bundled read failed', ['path' => $absolute]);

                    continue;
                }

                Storage::disk('public')->put($relative, $contents);
            }

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

    /**
     * @return list<array{path: string, alt: string, mime: string}>
     */
    private function downloadCommonsSources(): array
    {
        Storage::disk('public')->makeDirectory(self::SEED_STORAGE_DIR);
        $files = [];

        foreach ($this->commonsSources as $source) {
            $relative = self::SEED_STORAGE_DIR.'/'.$source['filename'];
            $absolute = Storage::disk('public')->path($relative);

            if (! Storage::disk('public')->exists($relative)) {
                try {
                    $response = Http::timeout(60)
                        ->withOptions(['allow_redirects' => true])
                        ->withHeaders([
                            'User-Agent' => 'TaghvimDefaSeeder/1.0 (educational seed; CC media only)',
                            'Accept' => 'image/*,*/*',
                        ])
                        ->get($source['url']);

                    if (! $response->successful()) {
                        Log::warning('ConflictMediaSeeder download failed', [
                            'url' => $source['url'],
                            'status' => $response->status(),
                        ]);

                        continue;
                    }

                    Storage::disk('public')->put($relative, $response->body());
                } catch (\Throwable $e) {
                    Log::warning('ConflictMediaSeeder download exception', [
                        'url' => $source['url'],
                        'error' => $e->getMessage(),
                    ]);

                    continue;
                }
            }

            if (! is_file($absolute)) {
                continue;
            }

            $mime = mime_content_type($absolute) ?: 'image/jpeg';
            if (! str_starts_with($mime, 'image/')) {
                continue;
            }

            $files[] = [
                'path' => $relative,
                'alt' => $source['alt'],
                'mime' => $mime,
            ];
        }

        return $files;
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
