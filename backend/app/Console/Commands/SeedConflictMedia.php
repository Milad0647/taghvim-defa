<?php

namespace App\Console\Commands;

use Database\Seeders\ConflictMediaSeeder;
use Illuminate\Console\Command;

class SeedConflictMedia extends Command
{
    protected $signature = 'app:seed-conflict-media {--force : Replace existing media on actions}';

    protected $description = 'Attach bundled conflict images (or Commons fallback) to actions';

    public function handle(): int
    {
        $seeder = new ConflictMediaSeeder;
        $seeder->setCommand($this);
        $seeder->run(force: (bool) $this->option('force'));

        return self::SUCCESS;
    }
}
