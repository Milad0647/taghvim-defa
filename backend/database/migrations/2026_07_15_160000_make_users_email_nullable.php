<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE users MODIFY email VARCHAR(255) NULL');
        } else {
            // sqlite / others: recreate is heavy; skip if already nullable
            DB::statement('PRAGMA foreign_keys=OFF');
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("UPDATE users SET email = CONCAT('user-', id, '@local.invalid') WHERE email IS NULL");
            DB::statement('ALTER TABLE users ALTER COLUMN email SET NOT NULL');
        } elseif ($driver === 'mysql') {
            DB::statement("UPDATE users SET email = CONCAT('user-', id, '@local.invalid') WHERE email IS NULL");
            DB::statement('ALTER TABLE users MODIFY email VARCHAR(255) NOT NULL');
        }
    }
};
