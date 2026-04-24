<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBadge extends Model
{
    protected $fillable = ['user_id', 'badge_key', 'awarded_at'];

    protected function casts(): array
    {
        return ['awarded_at' => 'datetime'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Human-readable badge metadata */
    public static array $definitions = [
        'first_post' => ['label' => 'First Post', 'emoji' => '✍️', 'desc' => 'Shared your first post'],
        'helper' => ['label' => 'Helper', 'emoji' => '🤝', 'desc' => 'Answered your first question'],
        'popular' => ['label' => 'Popular', 'emoji' => '🌟', 'desc' => 'Got 10 likes on a post'],
        'challenger' => ['label' => 'Challenger', 'emoji' => '🏆', 'desc' => 'Completed a fitness challenge'],
        'streak_7' => ['label' => '7-Day Streak', 'emoji' => '🔥', 'desc' => 'Maintained a 7-day activity streak'],
        'active' => ['label' => 'Active Member', 'emoji' => '💪', 'desc' => 'Made 10 community posts'],
    ];
}
