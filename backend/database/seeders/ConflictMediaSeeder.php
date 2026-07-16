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
 * Attaches Creative Commons / public-domain conflict imagery from Wikimedia Commons
 * to seeded actions. Commercial news agency photos are intentionally not scraped.
 */
class ConflictMediaSeeder extends Seeder
{
    /**
     * Freely licensed sources only (check Commons file page before changing).
     *
     * @var list<array{url: string, alt: string, filename: string}>
     */
    private array $sources = [
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

    public function run(): void
    {
        $localFiles = $this->downloadSources();
        if ($localFiles === []) {
            $this->command?->warn('ConflictMediaSeeder: no images downloaded; skipped.');

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
                continue;
            }

            $file = $localFiles[$index % count($localFiles)];
            $index++;

            $this->attachFile($action, $file['path'], $file['alt'], $file['mime']);
            $attached++;
        }

        $this->command?->info("ConflictMediaSeeder: attached media to {$attached} actions.");
    }

    /**
     * @return list<array{path: string, alt: string, mime: string}>
     */
    private function downloadSources(): array
    {
        Storage::disk('public')->makeDirectory('uploads/seed');
        $files = [];

        foreach ($this->sources as $source) {
            $relative = 'uploads/seed/'.$source['filename'];
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
