<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Throwable;

class SecurityLog
{
    public static function info(string $event, array $context = []): void
    {
        try {
            Log::channel('stack')->info('[security] '.$event, $context);
        } catch (Throwable) {
            // Never break auth/API because logging failed.
        }
    }

    public static function warning(string $event, array $context = []): void
    {
        try {
            Log::channel('stack')->warning('[security] '.$event, $context);
        } catch (Throwable) {
            // Never break auth/API because logging failed.
        }
    }
}
