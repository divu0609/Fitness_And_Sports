import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Heart, MessageCircle, Share2, Plus, Send, ChevronDown, ChevronUp,
    Trophy, Flame, Droplet, Activity, Calendar, MapPin, Users,
    Star, Zap, Award, X, ArrowLeft, CornerDownRight, Loader2,
    TrendingUp, Shield, LogIn,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────── */
interface Post {
    id: number;
    body: string;
    type: 'post' | 'question';
    image_url: string | null;
    likes_count: number;
    comments_count: number;
    created_at: string;
    liked_by_me: boolean;
    user: { id: number; name: string; avatar: string; xp: number };
}

interface Comment {
    id: number;
    body: string;
    created_at: string;
    user: { name: string; avatar: string };
    replies: Comment[];
}

interface Challenge {
    id: number;
    title: string;
    description: string;
    emoji: string;
    type: string;
    goal_value: number;
    xp_reward: number;
    ends_at: string;
    participants: number;
    leaderboard: { rank: number; name: string; avatar: string; current_value: number; completed: boolean }[];
    joined: boolean;
    my_value: number;
}

interface Event {
    id: number;
    title: string;
    description: string;
    emoji: string;
    location: string;
    category: string;
    event_date: string;
    event_time: string;
    current_participants: number;
    max_participants: number | null;
}

interface PageProps {
    auth: { user: any };
    posts: Post[];
    challenges: Challenge[];
    events: Event[];
    topContributors: { name: string; avatar: string; xp: number; badges: number }[];
    totalMembers: number;
    myXp: number;
    myBadges: string[];
}

const BADGE_META: Record<string, { label: string; emoji: string }> = {
    first_post: { label: 'First Post', emoji: '✍️' },
    helper:     { label: 'Helper', emoji: '🤝' },
    popular:    { label: 'Popular', emoji: '🌟' },
    challenger: { label: 'Challenger', emoji: '🏆' },
    streak_7:   { label: '7-Day Streak', emoji: '🔥' },
    active:     { label: 'Active Member', emoji: '💪' },
};

const TABS = ['Feed', 'Questions', 'Challenges', 'Events'] as const;
type Tab = (typeof TABS)[number];

const typeIcon = (type: string) => {
    if (type === 'steps')    return <Activity className="w-4 h-4" />;
    if (type === 'calories') return <Flame className="w-4 h-4" />;
    if (type === 'water')    return <Droplet className="w-4 h-4" />;
    return <Trophy className="w-4 h-4" />;
};

/* ─── Avatar bubble ─────────────────────────────────────── */
const Avatar = ({ letter, size = 'md', color = 'emerald' }: { letter: string; size?: 'sm' | 'md' | 'lg'; color?: string }) => {
    const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm';
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold shrink-0`}>
            {letter}
        </div>
    );
};

/* ─── Comment Thread ─────────────────────────────────────── */
const CommentThread = ({
    comment, postId, authed, depth = 0,
}: { comment: Comment; postId: number; authed: boolean; depth?: number }) => {
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showReplies, setShowReplies] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const submitReply = async () => {
        if (!replyText.trim()) return;
        setSubmitting(true);
        await axios.post(`/community/posts/${postId}/comment`, { body: replyText, parent_id: comment.id });
        setReplyText('');
        setReplying(false);
        setSubmitting(false);
        router.reload({ only: [] });
    };

    return (
        <div className={`${depth > 0 ? 'ml-8 border-l-2 border-slate-100 pl-3' : ''}`}>
            <div className="flex gap-2 mb-2">
                <Avatar letter={comment.user.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-none px-3 py-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-white">{comment.user.name}</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{comment.body}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-1">
                        <span className="text-[10px] text-slate-400">{comment.created_at}</span>
                        {authed && (
                            <button onClick={() => setReplying(!replying)} className="text-[11px] font-bold text-slate-400 hover:text-emerald-600 transition flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3" /> Reply
                            </button>
                        )}
                        {comment.replies.length > 0 && (
                            <button onClick={() => setShowReplies(!showReplies)} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition">
                                {showReplies ? `▲ Hide replies` : `▼ ${comment.replies.length} replies`}
                            </button>
                        )}
                    </div>
                    {replying && (
                        <div className="flex gap-2 mt-2">
                            <input
                                autoFocus
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitReply()}
                                placeholder={`Reply to ${comment.user.name}...`}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent"
                            />
                            <button onClick={submitReply} disabled={submitting} className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition disabled:opacity-50">
                                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {showReplies && comment.replies.map(reply => (
                <CommentThread key={reply.id} comment={reply} postId={postId} authed={authed} depth={depth + 1} />
            ))}
        </div>
    );
};

/* ─── Post Card ─────────────────────────────────────────── */
const PostCard = ({ post, authed }: { post: Post; authed: boolean }) => {
    const [liked, setLiked] = useState(post.liked_by_me);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [expanded, setExpanded] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const toggleLike = async () => {
        if (!authed) { router.visit('/login'); return; }
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikesCount(c => wasLiked ? c - 1 : c + 1);
        await axios.post(`/community/posts/${post.id}/like`);
    };

    const loadComments = async () => {
        if (expanded) { setExpanded(false); return; }
        setExpanded(true);
        setLoadingComments(true);
        const res = await axios.get(`/community/posts/${post.id}/comments`);
        setComments(res.data.comments);
        setLoadingComments(false);
    };

    const submitComment = async () => {
        if (!commentText.trim()) return;
        setSubmittingComment(true);
        await axios.post(`/community/posts/${post.id}/comment`, { body: commentText });
        setCommentText('');
        // Reload comments
        const res = await axios.get(`/community/posts/${post.id}/comments`);
        setComments(res.data.comments);
        setSubmittingComment(false);
    };

    const isQuestion = post.type === 'question';

    return (
        <div className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${isQuestion ? 'border-violet-100 dark:border-violet-900/30' : 'border-slate-100 dark:border-slate-800'}`}>
            {/* Post Header */}
            <div className="p-4 pb-3">
                <div className="flex items-start gap-3">
                    <Avatar letter={post.user.avatar} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{post.user.name}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">{post.user.xp} XP</span>
                            {isQuestion && (
                                <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    ❓ Question
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] text-slate-400">{post.created_at}</span>
                    </div>
                </div>
                <p className="mt-3 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{post.body}</p>
            </div>

            {/* Action Bar */}
            <div className="px-4 py-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLike}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-all active:scale-90 ${liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
                    >
                        <Heart className={`w-5 h-5 transition-transform ${liked ? 'fill-red-500 scale-110' : ''}`} />
                        {likesCount}
                    </button>
                    <button
                        onClick={loadComments}
                        className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-emerald-600 transition"
                    >
                        <MessageCircle className="w-5 h-5" />
                        {post.comments_count}
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                </div>
                <span className="text-xs text-slate-300 font-medium">{isQuestion ? '💬 Answers welcome' : '🌱 Community post'}</span>
            </div>

            {/* Comment Section */}
            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-50 dark:border-slate-800 pt-3">
                    {/* New Comment Box */}
                    {authed ? (
                        <div className="flex gap-2">
                            <input
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment()}
                                placeholder={isQuestion ? 'Write your answer...' : 'Add a comment...'}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent"
                            />
                            <button onClick={submitComment} disabled={submittingComment} className="w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition disabled:opacity-50">
                                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-full px-4 py-2 hover:text-emerald-600 transition">
                            <LogIn className="w-4 h-4" /> Log in to {isQuestion ? 'answer' : 'comment'}
                        </Link>
                    )}
                    {loadingComments ? (
                        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                    ) : comments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">{isQuestion ? 'No answers yet. Be the first to help!' : 'No comments yet. Start the conversation!'}</p>
                    ) : (
                        <div className="space-y-2">
                            {comments.map(c => <CommentThread key={c.id} comment={c} postId={post.id} authed={authed} />)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── Challenge Card ─────────────────────────────────────── */
const ChallengeCard = ({ challenge, authed }: { challenge: Challenge; authed: boolean }) => {
    const [joined, setJoined] = useState(challenge.joined);
    const [joining, setJoining] = useState(false);
    const pct = Math.min(100, Math.round((challenge.my_value / challenge.goal_value) * 100));

    const join = async () => {
        if (!authed) { router.visit('/login'); return; }
        setJoining(true);
        await axios.post(`/community/challenges/${challenge.id}/join`);
        setJoined(true);
        setJoining(false);
    };

    const rankColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];
    const rankMedals = ['🥇', '🥈', '🥉'];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-md shadow-orange-200">
                            {challenge.emoji}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight">{challenge.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-400">Ends {challenge.ends_at}</span>
                                <span className="text-xs bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Zap className="w-3 h-3" /> +{challenge.xp_reward} XP
                                </span>
                            </div>
                        </div>
                    </div>
                    {joined ? (
                        <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-full">✓ Joined</span>
                    ) : (
                        <button onClick={join} disabled={joining} className="text-xs bg-slate-900 text-white font-bold px-3 py-1.5 rounded-full hover:bg-emerald-600 transition disabled:opacity-50">
                            {joining ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Join'}
                        </button>
                    )}
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-4">{challenge.description}</p>

                {/* My Progress (if joined) */}
                {joined && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                            <span>Your Progress</span>
                            <span className="font-bold text-emerald-600">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                {challenge.leaderboard.length > 0 && (
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Leaderboard</span>
                        </div>
                        <div className="space-y-1.5">
                            {challenge.leaderboard.slice(0, 3).map((p, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <span className="text-base">{rankMedals[i] || `#${i + 1}`}</span>
                                    <Avatar letter={p.avatar} size="sm" />
                                    <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-white truncate">{p.name}</span>
                                    <span className="text-xs font-bold text-slate-400">{p.current_value.toLocaleString()}</span>
                                    {p.completed && <span className="text-xs">✅</span>}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400">{challenge.participants} participants</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Event Card ─────────────────────────────────────────── */
const EventCard = ({ event }: { event: Event }) => {
    const spotsLeft = event.max_participants ? event.max_participants - event.current_participants : null;
    const pctFull = event.max_participants ? Math.round((event.current_participants / event.max_participants) * 100) : 0;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-2xl shadow-md shadow-indigo-200 shrink-0">
                        {event.emoji}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight">{event.title}</h3>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full ml-2 shrink-0">{event.category}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">{event.event_date} · {event.event_time}</span>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed mb-3">{event.description}</p>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" /> {event.location}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="w-3 h-3 text-slate-400" />
                        {event.current_participants} joined
                        {spotsLeft !== null && <span className="text-emerald-600 font-bold"> · {spotsLeft} spots left</span>}
                    </div>
                </div>

                {event.max_participants && (
                    <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500" style={{ width: `${pctFull}%` }} />
                    </div>
                )}
            </div>
        </div>
    );
};

/* ─── Main Page ──────────────────────────────────────────── */
export default function Community() {
    const { auth, posts: initialPosts, challenges, events, topContributors, totalMembers, myXp, myBadges } = usePage().props as unknown as PageProps;
    const user = auth?.user ?? null;
    const authed = !!user;

    const [tab, setTab] = useState<Tab>('Feed');
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [composeText, setComposeText] = useState('');
    const [composeType, setComposeType] = useState<'post' | 'question'>('post');
    const [composing, setComposing] = useState(false);
    const [submittingPost, setSubmittingPost] = useState(false);

    // Visible posts for current tab
    const visiblePosts = tab === 'Questions' ? posts.filter(p => p.type === 'question') : posts;

    const submitPost = async () => {
        if (!composeText.trim()) return;
        setSubmittingPost(true);
        await axios.post('/community/posts', { body: composeText, type: composeType });
        setComposeText('');
        setComposing(false);
        setSubmittingPost(false);
        // Reload page to show new post
        window.location.reload();
    };

    // XP level calc
    const xpLevel = Math.floor(myXp / 100) + 1;
    const xpProgress = myXp % 100;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Head title="Community · FitCore" />

            {/* ── Hero Header ── */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white pt-14 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-10 w-32 h-32 rounded-full bg-emerald-400 blur-3xl" />
                    <div className="absolute bottom-0 right-10 w-40 h-40 rounded-full bg-violet-500 blur-3xl" />
                </div>
                <div className="max-w-2xl mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-3 mb-1">
                        <Link href="/dashboard" className="text-white/60 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <span className="text-white/60 text-sm">FitCore</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mt-2">Community 🌟</h1>
                    <p className="text-slate-400 text-sm mt-1 mb-4">Connect, compete, and grow together</p>

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-sm font-bold">{totalMembers.toLocaleString()} Members</span>
                        </div>
                        {authed && (
                            <>
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-sm font-bold">{myXp} XP · Lvl {xpLevel}</span>
                                </div>
                                {myBadges.length > 0 && (
                                    <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
                                        {myBadges.slice(0, 3).map(b => (
                                            <span key={b} title={BADGE_META[b]?.label}>{BADGE_META[b]?.emoji}</span>
                                        ))}
                                        {myBadges.length > 3 && <span className="text-xs text-white/60">+{myBadges.length - 3}</span>}
                                    </div>
                                )}
                            </>
                        )}
                        {!authed && (
                            <div className="flex gap-2">
                                <Link href="/login" className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-white/30 transition flex items-center gap-1">
                                    <LogIn className="w-3.5 h-3.5" /> Log In
                                </Link>
                                <Link href="/register" className="bg-emerald-500 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-emerald-400 transition">
                                    Join Free
                                </Link>
                            </div>
                        )}
                    </div>

                    {authed && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-white/60 mb-1">
                                <span>Level {xpLevel}</span>
                                <span>{xpProgress}/100 XP to Level {xpLevel + 1}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-700" style={{ width: `${xpProgress}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tab Bar ── */}
            <div className="bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-sm -mt-1">
                <div className="max-w-2xl mx-auto px-2 flex overflow-x-auto scrollbar-hide">
                    {TABS.map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`whitespace-nowrap px-5 py-4 font-semibold text-sm transition-all relative shrink-0 ${
                                tab === t ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            {t}
                            {tab === t && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Feed / Questions Tab */}
                {(tab === 'Feed' || tab === 'Questions') && (
                    <>
                        {/* Compose Box */}
                        {authed ? (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
                                {!composing ? (
                                    <button
                                        onClick={() => setComposing(true)}
                                        className="flex items-center gap-3 w-full text-left"
                                    >
                                        <Avatar letter={user.name?.[0]?.toUpperCase() ?? 'U'} />
                                        <span className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-200 transition">
                                            {tab === 'Questions' ? 'Ask the community a question...' : "What's on your fitness mind?"}
                                        </span>
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Post Type Toggle */}
                                        <div className="flex rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 gap-1 w-max">
                                            {(['post', 'question'] as const).map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setComposeType(t)}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${composeType === t ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white' : 'text-slate-400'}`}
                                                >
                                                    {t === 'post' ? '📝 Post' : '❓ Question'}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            autoFocus
                                            value={composeText}
                                            onChange={e => setComposeText(e.target.value)}
                                            placeholder={composeType === 'question' ? 'Ask your fitness question...' : 'Share your progress or tip...'}
                                            className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-sm border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 resize-none min-h-[100px]"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setComposing(false); setComposeText(''); }} className="px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
                                            <button
                                                onClick={submitPost}
                                                disabled={!composeText.trim() || submittingPost}
                                                className="px-6 py-2 bg-emerald-600 text-white rounded-full text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {submittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                {composeType === 'question' ? 'Ask' : 'Post'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Guest CTA banner */
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-5 text-white flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-bold">Join the conversation!</p>
                                    <p className="text-emerald-100 text-sm mt-0.5">Log in to post, answer questions, and earn XP.</p>
                                </div>
                                <Link href="/register" className="bg-white text-emerald-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-emerald-50 transition shrink-0">
                                    Join Free
                                </Link>
                            </div>
                        )}

                        {/* Posts */}
                        {visiblePosts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-5xl mb-3">{tab === 'Questions' ? '❓' : '🌱'}</div>
                                <p className="font-bold text-slate-800 dark:text-white">No {tab === 'Questions' ? 'questions' : 'posts'} yet</p>
                                <p className="text-slate-400 text-sm mt-1">Be the first to {tab === 'Questions' ? 'ask something!' : 'share something!'}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {visiblePosts.map(post => (
                                    <PostCard key={post.id} post={post} authed={authed} />
                                ))}
                            </div>
                        )}

                        {/* Top Contributors (bottom of feed) */}
                        {topContributors.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-4 h-4 text-amber-500" />
                                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Top Contributors</h3>
                                </div>
                                <div className="space-y-3">
                                    {topContributors.map((c, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-base">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                                            <Avatar letter={c.avatar} size="sm" />
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm text-slate-800 dark:text-white">{c.name}</div>
                                                <div className="text-xs text-slate-400">{c.badges} badges</div>
                                            </div>
                                            <div className="text-sm font-bold text-amber-500">{c.xp} XP</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Challenges Tab */}
                {tab === 'Challenges' && (
                    <>
                        <div className="flex items-center gap-2 px-1">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <h2 className="font-bold text-slate-800 dark:text-white">Active Challenges</h2>
                            <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">{challenges.length} Live</span>
                        </div>
                        {challenges.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-5xl mb-3">🏆</div>
                                <p className="font-bold text-slate-800 dark:text-white">No active challenges</p>
                                <p className="text-slate-400 text-sm mt-1">Check back soon!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {challenges.map(c => <ChallengeCard key={c.id} challenge={c} authed={authed} />)}
                            </div>
                        )}

                        {/* Badge Showcase */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-4 h-4 text-violet-500" />
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Earn These Badges</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(BADGE_META).map(([key, meta]) => (
                                    <div key={key} className={`rounded-2xl p-3 text-center border transition ${myBadges.includes(key) ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 opacity-60'}`}>
                                        <div className="text-2xl mb-1">{meta.emoji}</div>
                                        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{meta.label}</div>
                                        {myBadges.includes(key) && <div className="text-[8px] text-emerald-600 font-bold mt-0.5">EARNED</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Events Tab */}
                {tab === 'Events' && (
                    <>
                        <div className="flex items-center gap-2 px-1">
                            <Calendar className="w-5 h-5 text-indigo-500" />
                            <h2 className="font-bold text-slate-800 dark:text-white">Upcoming Events</h2>
                        </div>
                        {events.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-5xl mb-3">📅</div>
                                <p className="font-bold text-slate-800 dark:text-white">No upcoming events</p>
                                <p className="text-slate-400 text-sm mt-1">Stay tuned for community events!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {events.map(e => <EventCard key={e.id} event={e} />)}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
