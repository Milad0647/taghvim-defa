<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enemy_actions', function (Blueprint $table) {
            $table->json('custom_fields')->nullable()->after('status');
        });

        Schema::table('government_actions', function (Blueprint $table) {
            $table->json('custom_fields')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('enemy_actions', function (Blueprint $table) {
            $table->dropColumn('custom_fields');
        });

        Schema::table('government_actions', function (Blueprint $table) {
            $table->dropColumn('custom_fields');
        });
    }
};
