<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'username')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('username', 64)->nullable()->unique()->after('name');
            });
        }

        $used = [];

        foreach (DB::table('users')->orderBy('id')->get(['id', 'name', 'email', 'username']) as $row) {
            if (is_string($row->username) && $row->username !== '') {
                $used[Str::lower($row->username)] = true;

                continue;
            }

            $base = null;
            if (is_string($row->email) && $row->email !== '') {
                $base = str_contains($row->email, '@')
                    ? Str::before($row->email, '@')
                    : $row->email;
            }
            if (! $base) {
                $base = Str::slug((string) $row->name, '_') ?: 'user';
            }

            $base = Str::lower(Str::limit(preg_replace('/[^a-zA-Z0-9._-]/', '', $base) ?: 'user', 48, ''));
            $candidate = $base;
            $i = 1;
            while (isset($used[$candidate])) {
                $candidate = $base.'_'.$i;
                $i++;
            }

            $used[$candidate] = true;
            DB::table('users')->where('id', $row->id)->update(['username' => $candidate]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('users', 'username')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn('username');
        });
    }
};
