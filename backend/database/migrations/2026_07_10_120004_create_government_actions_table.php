<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('government_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_day_id')->constrained('calendar_days')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('response_to_id')->nullable()->constrained('enemy_actions')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('agency')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('status', 32)->default('published');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['calendar_day_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('government_actions');
    }
};
