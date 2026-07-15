<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use RuntimeException;

class BackupService
{
    private const RETENTION = 14;

    public function directory(): string
    {
        $dir = storage_path('app/backups');
        if (! File::isDirectory($dir)) {
            File::makeDirectory($dir, 0750, true);
        }

        return $dir;
    }

    /**
     * @return array{filename: string, path: string, size: int}
     */
    public function run(): array
    {
        $connection = config('database.default');
        $config = config("database.connections.{$connection}");

        if (($config['driver'] ?? '') !== 'pgsql') {
            throw new RuntimeException('Database backups currently support PostgreSQL only.');
        }

        $filename = 'backup-'.now()->format('Y-m-d_His').'.sql';
        $path = $this->directory().DIRECTORY_SEPARATOR.$filename;

        $host = $config['host'] ?? '127.0.0.1';
        $port = $config['port'] ?? '5432';
        $database = $config['database'] ?? '';
        $username = $config['username'] ?? '';
        $password = $config['password'] ?? '';

        $env = array_merge($_ENV, [
            'PGPASSWORD' => $password,
        ]);

        $result = Process::env($env)->run([
            'pg_dump',
            '-h', $host,
            '-p', (string) $port,
            '-U', $username,
            '-d', $database,
            '-F', 'p',
            '-f', $path,
        ]);

        if ($result->failed()) {
            throw new RuntimeException('pg_dump failed: '.$result->errorOutput());
        }

        $this->prune();

        return [
            'filename' => $filename,
            'path' => $path,
            'size' => File::size($path),
        ];
    }

    /**
     * @return list<array{filename: string, size: int, modified_at: string}>
     */
    public function list(): array
    {
        $files = File::files($this->directory());
        $items = [];

        foreach ($files as $file) {
            if ($file->getExtension() !== 'sql') {
                continue;
            }
            $items[] = [
                'filename' => $file->getFilename(),
                'size' => $file->getSize(),
                'modified_at' => date('c', $file->getMTime()),
            ];
        }

        usort($items, fn ($a, $b) => strcmp($b['modified_at'], $a['modified_at']));

        return $items;
    }

    public function absolutePath(string $filename): string
    {
        $safe = basename($filename);
        $path = $this->directory().DIRECTORY_SEPARATOR.$safe;

        if (! File::exists($path) || ! str_ends_with($safe, '.sql')) {
            throw new RuntimeException('Backup file not found.');
        }

        return $path;
    }

    private function prune(): void
    {
        $items = $this->list();
        foreach (array_slice($items, self::RETENTION) as $old) {
            File::delete($this->directory().DIRECTORY_SEPARATOR.$old['filename']);
        }
    }
}
