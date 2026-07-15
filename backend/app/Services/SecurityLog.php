<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class SecurityLog
{
    public static function info(string $event, array $context = []): void
    {
        Log::channel('stack')->info('[security] '.$event, $context);
    }

    public static function warning(string $event, array $context = []): void
    {
        Log::channel('stack')->warning('[security] '.$event, $context);
    }
}
