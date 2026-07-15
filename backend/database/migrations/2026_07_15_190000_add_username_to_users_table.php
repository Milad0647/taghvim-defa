<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 64)->nullable()->unique()->after('name');
        });

        User::query()->orderBy('id')->each(function (User $user): void {
            $base = null;
            if (is_string($user->email) && $user->email !== '') {
                $base = str_contains($user->email, '@')
                    ? Str::before($user->email, '@')
                    : $user->email;
            }
            if (! $base) {
                $base = Str::slug((string) $user->name, '_') ?: 'user';
            }

            $base = Str::lower(Str::limit(preg_replace('/[^a-zA-Z0-9._-]/', '', $base) ?: 'user', 48, ''));
            $candidate = $base;
            $i = 1;
            while (
                User::query()
                    ->where('username', $candidate)
                    ->where('id', '!=', $user->id)
                    ->exists()
            ) {
                $candidate = $base.'_'.$i;
                $i++;
            }

            $user->forceFill(['username' => $candidate])->saveQuietly();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn('username');
        });
    }
};
