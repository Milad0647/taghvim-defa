<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enemy_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_day_id')->constrained('calendar_days')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('severity', 16)->default('medium'); // low | medium | high | critical
            $table->string('source')->nullable();
            $table->string('location')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->string('status', 32)->default('published');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['calendar_day_id', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enemy_actions');
    }
};
