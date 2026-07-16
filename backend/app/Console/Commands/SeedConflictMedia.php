<?php

namespace App\Console\Commands;

use Database\Seeders\ConflictMediaSeeder;
use Illuminate\Console\Command;

class SeedConflictMedia extends Command
{
    protected $signature = 'app:seed-conflict-media';

    protected $description = 'Attach CC-licensed Wikimedia Commons images to actions that have no media';

    public function handle(): int
    {
        $this->call(ConflictMediaSeeder::class);

        return self::SUCCESS;
    }
}
