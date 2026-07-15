<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Collapse removed roles into editor
        DB::table('users')
            ->whereIn('role', ['reviewer', 'viewer'])
            ->update(['role' => 'editor']);
    }

    public function down(): void
    {
        // Irreversible role collapse
    }
};
