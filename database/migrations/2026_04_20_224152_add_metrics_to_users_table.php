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
        Schema::table('users', function (Blueprint $table) {
            $table->integer('age')->nullable();
            $table->string('gender')->nullable(); // male, female
            $table->integer('height_cm')->nullable();
            $table->float('weight_kg')->nullable();
            $table->string('fitness_goal')->nullable(); // lose, maintain, gain
            
            // Dynamic Goals assigned by Gemini
            $table->integer('daily_calorie_target')->nullable();
            $table->integer('daily_protein_target')->nullable();
            $table->integer('daily_carbs_target')->nullable();
            $table->integer('daily_fats_target')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'age', 
                'gender', 
                'height_cm', 
                'weight_kg', 
                'fitness_goal', 
                'daily_calorie_target', 
                'daily_protein_target', 
                'daily_carbs_target', 
                'daily_fats_target'
            ]);
        });
    }
};
