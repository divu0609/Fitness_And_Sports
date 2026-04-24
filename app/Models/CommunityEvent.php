<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunityEvent extends Model
{
    protected $fillable = [
        'title', 'description', 'emoji', 'location',
        'event_date', 'max_participants', 'current_participants', 'category',
    ];

    protected function casts(): array
    {
        return ['event_date' => 'datetime'];
    }
}
