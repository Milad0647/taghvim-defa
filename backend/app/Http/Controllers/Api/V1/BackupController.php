<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\BackupService;
use App\Services\SecurityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class BackupController extends Controller
{
    public function __construct(private readonly BackupService $backupService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => $this->backupService->list(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $result = $this->backupService->run();
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }

        SecurityLog::info('backup.created', [
            'actor_id' => $request->user()?->id,
            'filename' => $result['filename'],
        ]);

        return response()->json(['data' => $result], 201);
    }

    public function download(string $filename): BinaryFileResponse
    {
        $path = $this->backupService->absolutePath($filename);

        return response()->download($path, basename($path), [
            'Content-Type' => 'application/sql',
        ]);
    }
}
