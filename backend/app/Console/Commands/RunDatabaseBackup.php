<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;
use Throwable;

class RunDatabaseBackup extends Command
{
    protected $signature = 'backup:run';

    protected $description = 'Create a PostgreSQL database backup dump';

    public function handle(BackupService $backupService): int
    {
        try {
            $result = $backupService->run();
            $this->info('Backup created: '.$result['filename'].' ('.$result['size'].' bytes)');

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
