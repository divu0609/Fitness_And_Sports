<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('emoji')->default('📅');
            $table->string('location')->nullable();
            $table->dateTime('event_date');
            $table->unsignedInteger('max_participants')->nullable();
            $table->unsignedInteger('current_participants')->default(0);
            $table->string('category')->default('General');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_events');
    }
};
