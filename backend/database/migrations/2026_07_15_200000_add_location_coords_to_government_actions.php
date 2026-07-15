<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('government_actions', function (Blueprint $table) {
            if (! Schema::hasColumn('government_actions', 'location')) {
                $table->string('location')->nullable()->after('agency');
            }
            if (! Schema::hasColumn('government_actions', 'latitude')) {
                $table->decimal('latitude', 10, 7)->nullable()->after('location');
            }
            if (! Schema::hasColumn('government_actions', 'longitude')) {
                $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            }
        });
    }

    public function down(): void
    {
        Schema::table('government_actions', function (Blueprint $table) {
            if (Schema::hasColumn('government_actions', 'longitude')) {
                $table->dropColumn('longitude');
            }
            if (Schema::hasColumn('government_actions', 'latitude')) {
                $table->dropColumn('latitude');
            }
            if (Schema::hasColumn('government_actions', 'location')) {
                $table->dropColumn('location');
            }
        });
    }
};
