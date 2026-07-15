<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('agency_ids')->nullable()->after('permissions');
        });

        Schema::table('enemy_actions', function (Blueprint $table) {
            $table->string('agency_id', 64)->nullable()->after('created_by');
            $table->index('agency_id');
        });

        Schema::table('government_actions', function (Blueprint $table) {
            $table->string('agency_id', 64)->nullable()->after('created_by');
            $table->index('agency_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('agency_ids');
        });

        Schema::table('enemy_actions', function (Blueprint $table) {
            $table->dropIndex(['agency_id']);
            $table->dropColumn('agency_id');
        });

        Schema::table('government_actions', function (Blueprint $table) {
            $table->dropIndex(['agency_id']);
            $table->dropColumn('agency_id');
        });
    }
};
