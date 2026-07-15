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

        $pgDump = $this->resolvePgDumpBinary();

        $filename = 'backup-'.now()->format('Y-m-d_His').'.sql';
        $path = $this->directory().DIRECTORY_SEPARATOR.$filename;

        $host = $config['host'] ?? '127.0.0.1';
        $port = $config['port'] ?? '5432';
        $database = $config['database'] ?? '';
        $username = $config['username'] ?? '';
        $password = $config['password'] ?? '';

        $env = array_merge($_ENV, [
            'PGPASSWORD' => (string) $password,
        ]);

        $result = Process::env($env)->timeout(300)->run([
            $pgDump,
            '-h', (string) $host,
            '-p', (string) $port,
            '-U', (string) $username,
            '-d', (string) $database,
            '-F', 'p',
            '--no-owner',
            '--no-acl',
            '-f', $path,
        ]);

        if ($result->failed()) {
            $error = trim($result->errorOutput() ?: $result->output());
            throw new RuntimeException('pg_dump failed: '.($error !== '' ? $error : 'unknown error'));
        }

        if (! File::exists($path) || File::size($path) === 0) {
            throw new RuntimeException('pg_dump finished but backup file is empty or missing.');
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

    private function resolvePgDumpBinary(): string
    {
        $configured = trim((string) env('PG_DUMP_PATH', ''));
        if ($configured !== '' && is_executable($configured)) {
            return $configured;
        }

        $candidates = [
            'pg_dump',
            '/usr/bin/pg_dump',
            '/usr/local/bin/pg_dump',
            '/usr/lib/postgresql/16/bin/pg_dump',
            '/usr/lib/postgresql/15/bin/pg_dump',
        ];

        foreach ($candidates as $binary) {
            if ($binary === 'pg_dump') {
                $which = Process::run(['sh', '-c', 'command -v pg_dump']);
                if ($which->successful()) {
                    $found = trim($which->output());
                    if ($found !== '') {
                        return $found;
                    }
                }

                continue;
            }

            if (is_executable($binary)) {
                return $binary;
            }
        }

        throw new RuntimeException(
            'pg_dump not found. Install postgresql-client in the API image (or set PG_DUMP_PATH).',
        );
    }

    private function prune(): void
    {
        $items = $this->list();
        foreach (array_slice($items, self::RETENTION) as $old) {
            File::delete($this->directory().DIRECTORY_SEPARATOR.$old['filename']);
        }
    }
}
