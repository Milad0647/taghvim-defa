<?php

namespace App\Support;

final class IranMobile
{
    /**
     * Normalize common Iranian mobile formats to 09xxxxxxxxx.
     */
    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value) ?? '';
        if ($digits === '') {
            return null;
        }

        if (str_starts_with($digits, '0098')) {
            $digits = substr($digits, 4);
        } elseif (str_starts_with($digits, '98')) {
            $digits = substr($digits, 2);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '9')) {
            $digits = '0'.$digits;
        }

        return $digits;
    }

    public static function isValid(?string $normalized): bool
    {
        if ($normalized === null || $normalized === '') {
            return false;
        }

        return (bool) preg_match('/^09\d{9}$/', $normalized);
    }
}
