<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fitness_challenges', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['steps', 'calories', 'streak', 'water'])->default('steps');
            $table->string('emoji')->default('🏆');
            $table->unsignedBigInteger('goal_value');
            $table->unsignedInteger('xp_reward')->default(50);
            $table->date('starts_at');
            $table->date('ends_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fitness_challenges');
    }
};
