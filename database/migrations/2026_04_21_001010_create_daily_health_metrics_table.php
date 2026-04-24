<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('daily_health_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->integer('water_glasses')->default(0);
            $table->integer('steps')->default(0);
            $table->integer('sleep_minutes')->default(0);
            $table->integer('workout_calories_burned')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'date']); // Prevent duplicate dates uniquely
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_health_metrics');
    }
};
