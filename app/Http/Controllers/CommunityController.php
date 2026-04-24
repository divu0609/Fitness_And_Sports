<?php

namespace App\Http\Controllers;

use App\Models\ChallengeParticipant;
use App\Models\CommunityEvent;
use App\Models\CommunityPost;
use App\Models\FitnessChallenge;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommunityController extends Controller
{
    /** PUBLIC — render the community page with all seed data */
    public function index(Request $request)
    {
        $user = $request->user();

        // Posts feed (all types, latest first)
        $posts = CommunityPost::with('user')
            ->latest()
            ->get()
            ->map(function ($post) use ($user) {
                return [
                    'id' => $post->id,
                    'body' => $post->body,
                    'type' => $post->type,
                    'image_url' => $post->image_url,
                    'likes_count' => $post->likes_count,
                    'comments_count' => $post->comments_count,
                    'created_at' => $post->created_at->diffForHumans(),
                    'liked_by_me' => $user ? $post->likes()->where('user_id', $user->id)->exists() : false,
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'avatar' => strtoupper(substr($post->user->name, 0, 1)),
                        'xp' => $post->user->xp_points ?? 0,
                    ],
                ];
            });

        // Active challenges with leaderboard
        $challenges = FitnessChallenge::whereDate('ends_at', '>=', now())
            ->with(['participants.user'])
            ->get()
            ->map(function ($challenge) use ($user) {
                $leaderboard = $challenge->participants()
                    ->with('user')
                    ->orderByDesc('current_value')
                    ->take(5)
                    ->get()
                    ->map(fn ($p, $rank) => [
                        'rank' => $rank + 1,
                        'name' => $p->user->name,
                        'avatar' => strtoupper(substr($p->user->name, 0, 1)),
                        'current_value' => $p->current_value,
                        'completed' => $p->completed,
                    ]);

                $myParticipation = $user
                    ? $challenge->participants()->where('user_id', $user->id)->first()
                    : null;

                return [
                    'id' => $challenge->id,
                    'title' => $challenge->title,
                    'description' => $challenge->description,
                    'emoji' => $challenge->emoji,
                    'type' => $challenge->type,
                    'goal_value' => $challenge->goal_value,
                    'xp_reward' => $challenge->xp_reward,
                    'ends_at' => $challenge->ends_at->format('M d'),
                    'participants' => $challenge->participants()->count(),
                    'leaderboard' => $leaderboard,
                    'joined' => $myParticipation !== null,
                    'my_value' => $myParticipation?->current_value ?? 0,
                ];
            });

        // Upcoming events
        $events = CommunityEvent::whereDate('event_date', '>=', now())
            ->orderBy('event_date')
            ->get()
            ->map(fn ($event) => [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'emoji' => $event->emoji,
                'location' => $event->location,
                'category' => $event->category,
                'event_date' => $event->event_date->format('D, M j'),
                'event_time' => $event->event_date->format('g:i A'),
                'current_participants' => $event->current_participants,
                'max_participants' => $event->max_participants,
            ]);

        // Top contributors for sidebar
        $topContributors = User::orderByDesc('xp_points')
            ->take(5)
            ->get()
            ->map(fn ($u) => [
                'name' => $u->name,
                'avatar' => strtoupper(substr($u->name, 0, 1)),
                'xp' => $u->xp_points ?? 0,
                'badges' => $u->badge_count ?? 0,
            ]);

        return Inertia::render('Community', [
            'posts' => $posts,
            'challenges' => $challenges,
            'events' => $events,
            'topContributors' => $topContributors,
            'totalMembers' => User::count(),
            'myXp' => $user?->xp_points ?? 0,
            'myBadges' => $user ? UserBadge::where('user_id', $user->id)->get()->map(fn ($b) => $b->badge_key)->toArray() : [],
        ]);
    }

    /** PUBLIC JSON — lightweight feed for Dashboard widget */
    public function feed(Request $request)
    {
        $user = $request->user();

        $posts = CommunityPost::with('user')
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($post) use ($user) {
                return [
                    'id' => $post->id,
                    'body' => $post->body,
                    'type' => $post->type,
                    'likes_count' => $post->likes_count,
                    'comments_count' => $post->comments_count,
                    'created_at' => $post->created_at->diffForHumans(),
                    'liked_by_me' => $user ? $post->likes()->where('user_id', $user->id)->exists() : false,
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'avatar' => strtoupper(substr($post->user->name, 0, 1)),
                        'xp' => $post->user->xp_points ?? 0,
                    ],
                ];
            });

        return response()->json(['posts' => $posts]);
    }

    /** AUTH — create a post or question */
    public function store(Request $request)
    {
        $request->validate([
            'body' => 'required|string|min:3|max:2000',
            'type' => 'required|in:post,question',
        ]);

        $user = $request->user();

        $post = CommunityPost::create([
            'user_id' => $user->id,
            'body' => $request->body,
            'type' => $request->type,
            'xp_earned' => 10,
        ]);

        // Award XP
        $user->increment('xp_points', 10);

        // First post badge
        $this->awardBadge($user, 'first_post');

        // Active member badge (10 posts)
        if (CommunityPost::where('user_id', $user->id)->count() >= 10) {
            $this->awardBadge($user, 'active');
        }

        return response()->json(['success' => true, 'post_id' => $post->id]);
    }

    /** AUTH — toggle like on a post */
    public function like(Request $request, CommunityPost $post)
    {
        $user = $request->user();
        $existing = PostLike::where('user_id', $user->id)->where('post_id', $post->id)->first();

        if ($existing) {
            $existing->delete();
            $post->decrement('likes_count');
        } else {
            PostLike::create(['user_id' => $user->id, 'post_id' => $post->id]);
            $post->increment('likes_count');

            // Popular badge — post owner gets badge when their post hits 10 likes
            if ($post->likes_count >= 10) {
                $this->awardBadge($post->user, 'popular');
            }
        }

        return response()->json([
            'liked' => ! $existing,
            'likes_count' => $post->fresh()->likes_count,
        ]);
    }

    /** PUBLIC — get threaded comments for a post */
    public function comments(CommunityPost $post)
    {
        $comments = PostComment::where('post_id', $post->id)
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->latest()
            ->get()
            ->map(fn ($c) => $this->formatComment($c));

        return response()->json(['comments' => $comments]);
    }

    /** AUTH — add a comment or reply */
    public function comment(Request $request, CommunityPost $post)
    {
        $request->validate([
            'body' => 'required|string|min:1|max:1000',
            'parent_id' => 'nullable|exists:post_comments,id',
        ]);

        $user = $request->user();

        PostComment::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'parent_id' => $request->parent_id,
            'body' => $request->body,
        ]);

        $post->increment('comments_count');

        // Award XP for answering questions
        $user->increment('xp_points', 5);

        if ($post->type === 'question') {
            $this->awardBadge($user, 'helper');
        }

        return response()->json(['success' => true]);
    }

    /** AUTH — join a fitness challenge */
    public function joinChallenge(Request $request, FitnessChallenge $challenge)
    {
        $user = $request->user();

        ChallengeParticipant::firstOrCreate([
            'user_id' => $user->id,
            'challenge_id' => $challenge->id,
        ]);

        return response()->json(['success' => true]);
    }

    /** Helper — award badge if not already owned */
    private function awardBadge(User $user, string $badgeKey): void
    {
        $created = UserBadge::firstOrCreate(
            ['user_id' => $user->id, 'badge_key' => $badgeKey],
            ['awarded_at' => now()]
        );

        if ($created->wasRecentlyCreated) {
            $user->increment('badge_count');
        }
    }

    private function formatComment(PostComment $comment): array
    {
        return [
            'id' => $comment->id,
            'body' => $comment->body,
            'created_at' => $comment->created_at->diffForHumans(),
            'user' => [
                'name' => $comment->user->name,
                'avatar' => strtoupper(substr($comment->user->name, 0, 1)),
            ],
            'replies' => $comment->replies->map(fn ($r) => $this->formatComment($r))->toArray(),
        ];
    }
}
