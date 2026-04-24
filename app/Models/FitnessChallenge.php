<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FitnessChallenge extends Model
{
    protected $fillable = [
        'title', 'description', 'type', 'emoji',
        'goal_value', 'xp_reward', 'starts_at', 'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'date',
            'ends_at' => 'date',
            'goal_value' => 'integer',
            'xp_reward' => 'integer',
        ];
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ChallengeParticipant::class, 'challenge_id');
    }

    /** Top N participants ordered by progress */
    public function leaderboard(int $limit = 5): HasMany
    {
        return $this->hasMany(ChallengeParticipant::class, 'challenge_id')
            ->with('user')
            ->orderByDesc('current_value')
            ->limit($limit);
    }
}
