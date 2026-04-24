import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router, Link } from '@inertiajs/react';
import {
    Flame, Target, Activity, Utensils, Droplet,
    ChevronRight, Settings, Plus, Loader2, Bot,
    Calendar, Users, Heart, MessageCircle, Send, ArrowRight,
    Moon, TrendingUp, Footprints, Sparkles, ExternalLink,
    Trophy, Zap, CheckCircle2,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface Meal {
    id?: number;
    meal_type: string;
    food_description: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

const mealCategories = [
    { title: 'Breakfast', icon: '🍞', color: 'from-amber-400 to-orange-500', dot: 'bg-orange-400' },
    { title: 'Morning Snack', icon: '🥜', color: 'from-lime-400 to-green-500', dot: 'bg-lime-400' },
    { title: 'Lunch', icon: '🥗', color: 'from-emerald-400 to-teal-500', dot: 'bg-emerald-400' },
    { title: 'Evening Snack', icon: '🍐', color: 'from-cyan-400 to-blue-500', dot: 'bg-cyan-400' },
    { title: 'Dinner', icon: '🍽️', color: 'from-violet-400 to-purple-500', dot: 'bg-violet-400' },
];

/* ── SVG Calorie Ring ── */
function RingProgress({ pct, size = 120, stroke = 10, color = '#10b981', bg = 'rgba(255,255,255,0.08)', children }: {
    pct: number; size?: number; stroke?: number; color?: string; bg?: string; children?: React.ReactNode;
}) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">{children}</div>
        </div>
    );
}

/* ── Animated counter ── */
function AnimNum({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);
    const prev = useRef(0);
    useEffect(() => {
        const start = prev.current, end = value, dur = 600, t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / dur);
            setDisplay(Math.round(start + (end - start) * p));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        prev.current = end;
    }, [value]);
    return <>{display.toLocaleString()}</>;
}

/* ── Linear bar ── */
function Bar({ label, val, target, color }: { label: string; val: number; target: number; color: string }) {
    const pct = Math.min(100, Math.round((val / target) * 100));
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">{label}</span>
                <span className="text-slate-700 dark:text-slate-200">{val}g <span className="text-slate-400 font-normal">/ {target}g</span></span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

/* ── Stat tile ── */
function StatTile({ icon, label, value, unit, sub, accent }: {
    icon: React.ReactNode; label: string; value: string | number; unit?: string; sub?: string; accent: string;
}) {
    return (
        <div className={`relative rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden group`}>
            <div className={`absolute -top-3 -right-3 w-16 h-16 rounded-full opacity-10 ${accent} blur-xl`} />
            <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent} text-white shadow-sm`}>
                    {icon}
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</span>
                {unit && <span className="text-xs font-bold text-slate-400 pb-0.5 ml-0.5">{unit}</span>}
            </div>
            {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
        </div>
    );
}

export default function Dashboard() {
    const user = usePage().props.auth.user as any;

    /* ── Meal state ── */
    const [meals, setMeals] = useState<Meal[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [foodText, setFoodText] = useState('');
    const [activeMealType, setActiveMealType] = useState('Breakfast');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    /* ── Onboarding state ── */
    const needsOnboarding = !user.daily_calorie_target;
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(needsOnboarding);
    const [onboardForm, setOnboardForm] = useState({ age: 26, gender: 'male', height_cm: 175, weight_kg: 78, target_weight_kg: 70, target_months: 3 });
    const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
    const [onboardError, setOnboardError] = useState('');

    /* ── 3-D tilt for Goals modal ── */
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
        const y = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        setTilt({ x, y });
    };
    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

    /* ── Metrics state ── */
    const [metrics, setMetrics] = useState({ water_glasses: 0, steps: 0, sleep_minutes: 0, workout_calories_burned: 0 });
    const [streak, setStreak] = useState(user.current_streak || 0);
    const [isStepSyncing, setIsStepSyncing] = useState(false);

    /* ── Step goal (persisted in localStorage, SSR-safe) ── */
    const [stepGoal, setStepGoal] = useState<number>(() => {
        if (typeof window === 'undefined') return 10000;
        return parseInt(localStorage.getItem('fitcore_step_goal') || '10000');
    });
    const [isEditingStepGoal, setIsEditingStepGoal] = useState(false);
    const [stepGoalInput, setStepGoalInput] = useState('');

    /* ── Weight tracking ── */
    const [currentWeight, setCurrentWeight] = useState<number>(user.weight_kg || 0);
    const [weightInput, setWeightInput] = useState<string>(user.weight_kg ? String(user.weight_kg) : '');
    const [isSavingWeight, setIsSavingWeight] = useState(false);
    const [weightSaved, setWeightSaved] = useState(false);
    const targetWeight = user.target_weight_kg || 0;

    /* ── Community feed state ── */
    interface CPost { id: number; body: string; type: string; likes_count: number; comments_count: number; created_at: string; liked_by_me: boolean; user: { name: string; avatar: string; xp: number }; }
    const [communityPosts, setCommunityPosts] = useState<CPost[]>([]);
    const [communityLoading, setCommunityLoading] = useState(false);
    const [composeText, setComposeText] = useState('');
    const [composeType, setComposeType] = useState<'post' | 'question'>('post');
    const [submittingPost, setSubmittingPost] = useState(false);
    const [postLikes, setPostLikes] = useState<Record<number, { liked: boolean; count: number }>>({});

    /* ── Goals ── */
    const dailyGoal = user.daily_calorie_target || 2000;
    const proteinTarget = user.daily_protein_target || 150;
    const carbsTarget = user.daily_carbs_target || 200;
    const fatsTarget = user.daily_fats_target || 65;

    /* ── Computed ── */
    const consumedCal = meals.reduce((a, m) => a + m.calories, 0);
    const consumedProt = meals.reduce((a, m) => a + m.protein, 0);
    const consumedCarb = meals.reduce((a, m) => a + m.carbs, 0);
    const consumedFat = meals.reduce((a, m) => a + m.fats, 0);
    const pctCal = Math.min(100, Math.round((consumedCal / dailyGoal) * 100));
    const remaining = Math.max(0, dailyGoal - consumedCal);
    const mealBudget = Math.round(dailyGoal * 0.28);
    const snackBudget = Math.round(dailyGoal * 0.08);
    const getBudget = (t: string) => t.includes('Snack') ? snackBudget : mealBudget;
    const getCalType = (t: string) => meals.filter(m => m.meal_type === t).reduce((a, m) => a + m.calories, 0);

    const getDate = () => {
        const l = new Date();
        return new Date(l.getTime() - l.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    };

    const hour = new Date().getHours();
    const { greeting, greetEmoji, greetSub } = (() => {
        if (hour >= 4 && hour < 6) return { greeting: 'Rise & shine', greetEmoji: '🌅', greetSub: "Early bird gets the gains!" };
        if (hour >= 6 && hour < 9) return { greeting: 'Good morning', greetEmoji: '☀️', greetSub: "Let's make today count!" };
        if (hour >= 9 && hour < 12) return { greeting: 'Morning hustle', greetEmoji: '💪', greetSub: "You're crushing it!" };
        if (hour >= 12 && hour < 14) return { greeting: 'Good afternoon', greetEmoji: '🍽️', greetSub: "Don't skip lunch!" };
        if (hour >= 14 && hour < 17) return { greeting: 'Keep it up', greetEmoji: '⚡', greetSub: "Afternoon power hour!" };
        if (hour >= 17 && hour < 19) return { greeting: 'Golden hour', greetEmoji: '🌆', greetSub: "Time for an evening workout?" };
        if (hour >= 19 && hour < 22) return { greeting: 'Good evening', greetEmoji: '🌙', greetSub: "Wind down and recover." };
        if (hour >= 22 && hour < 24) return { greeting: 'Night mode on', greetEmoji: '🌙✨', greetSub: "Rest up — recovery counts!" };
        return { greeting: 'Burning midnight oil', greetEmoji: '🔥', greetSub: "The grind never stops!" };
    })();

    /* ── Effects ── */
    useEffect(() => {
        axios.get(`/api/meals?client_date=${getDate()}`).then(r => { if (r.data?.meals) setMeals(r.data.meals); });
        axios.get(`/api/metrics?client_date=${getDate()}`).then(r => {
            if (r.data?.metrics) { setMetrics(r.data.metrics); if (r.data.streak !== undefined) setStreak(r.data.streak); }
        });
        loadFeed();
    }, []);

    /* ── Metric update ── */
    const updateMetric = async (field: string, value: number) => {
        setMetrics(p => ({ ...p, [field]: value }));
        const r = await axios.post('/api/metrics', { client_date: getDate(), field, value });
        if (r.data.streak !== undefined) setStreak(r.data.streak);
    };

    const analyzeSteps = async (steps: number) => {
        if (!steps) return;
        setIsStepSyncing(true);
        try {
            const r = await axios.post('/api/metrics/analyze-steps', { steps });
            if (r.data.success && r.data.calories_burned) updateMetric('workout_calories_burned', r.data.calories_burned);
        } catch { }
        setIsStepSyncing(false);
    };

    /* ── Meal logging ── */
    const logMeal = async () => {
        if (!foodText.trim()) return;
        setIsAiLoading(true); setErrorMsg('');
        try {
            const r = await axios.post('/api/meals/analyze', { food_description: foodText, meal_type: activeMealType, client_date: getDate() });
            if (r.data.success) { setMeals(p => [...p, r.data.meal]); setFoodText(''); setIsModalOpen(false); }
        } catch (e: any) {
            const d = e.response?.data;
            setErrorMsg((d?.error || 'Could not analyze meal.') + (d?.details ? ` (${d.details})` : ''));
        }
        setIsAiLoading(false);
    };

    /* ── Onboarding ── */
    const submitOnboarding = async () => {
        setIsOnboardingLoading(true); setOnboardError('');
        try {
            const r = await axios.post('/api/profile/calculate-targets', onboardForm);
            if (r.data.success) { router.reload({ only: ['auth'] }); setIsOnboardingOpen(false); }
        } catch (e: any) {
            const d = e.response?.data;
            setOnboardError((d?.message || d?.error || 'Failed.') + (d?.details ? ` (${d.details})` : ''));
        }
        setIsOnboardingLoading(false);
    };

    /* ── Community ── */
    const loadFeed = async () => {
        setCommunityLoading(true);
        try {
            const r = await axios.get('/community/feed');
            const posts = r.data.posts ?? [];
            setCommunityPosts(posts);
            const lk: Record<number, { liked: boolean; count: number }> = {};
            posts.forEach((p: CPost) => { lk[p.id] = { liked: p.liked_by_me, count: p.likes_count }; });
            setPostLikes(lk);
        } catch { }
        setCommunityLoading(false);
    };

    const toggleLike = async (id: number) => {
        const c = postLikes[id] ?? { liked: false, count: 0 };
        setPostLikes(p => ({ ...p, [id]: { liked: !c.liked, count: c.liked ? c.count - 1 : c.count + 1 } }));
        await axios.post(`/community/posts/${id}/like`);
    };

    const submitPost = async () => {
        if (!composeText.trim()) return;
        setSubmittingPost(true);
        await axios.post('/community/posts', { body: composeText, type: composeType });
        setComposeText('');
        await loadFeed();
        setSubmittingPost(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Liquid button keyframes */}
            <style>{`
                @keyframes liquid-morph {
                    0%   { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    25%  { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                    50%  { border-radius: 50% 60% 30% 60% / 30% 40% 70% 50%; }
                    75%  { border-radius: 40% 60% 50% 40% / 60% 30% 60% 40%; }
                    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                }
                .liquid-btn {
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .liquid-btn::before {
                    content: '';
                    position: absolute;
                    inset: -6px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7, #6366f1);
                    background-size: 300% 300%;
                    animation: liquid-morph 4s ease-in-out infinite, gradient-shift 3s ease infinite;
                    z-index: 0;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .liquid-btn:hover::before {
                    opacity: 1;
                }
                .liquid-btn > * { position: relative; z-index: 1; }
                .liquid-btn:hover {
                    transform: scale(1.02);
                    box-shadow: 0 20px 40px -8px rgba(99,102,241,0.5), 0 0 0 2px rgba(139,92,246,0.4);
                }
                .liquid-btn:active { transform: scale(0.98); }
                @keyframes gradient-shift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
            <Head title="Dashboard" />

            {/* ════════════════════════════════════════════════════
                TOP HERO BAR — full width dark gradient
            ════════════════════════════════════════════════════ */}
            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white px-8 py-8 overflow-hidden">
                {/* glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                    {/* greeting */}
                    <div>
                        <p className="text-slate-400 text-sm font-medium">{greetEmoji} {greeting}</p>
                        <h1 className="text-3xl font-black tracking-tight mt-1">
                            {user.name} <span className="text-emerald-400">👋</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 italic">{greetSub}</p>
                    </div>

                    {/* center — big ring */}
                    <div className="flex flex-col items-center">
                        <RingProgress pct={pctCal} size={140} stroke={11} color="#10b981" bg="rgba(255,255,255,0.08)">
                            <div className="text-center">
                                <div className="text-2xl font-black tracking-tighter leading-none"><AnimNum value={consumedCal} /></div>
                                <div className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-0.5">kcal eaten</div>
                            </div>
                        </RingProgress>
                        <div className="mt-2 text-center">
                            <span className="text-emerald-400 font-black">{remaining.toLocaleString()}</span>
                            <span className="text-white/50 text-xs ml-1">kcal left of {dailyGoal.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* right — macros + actions */}
                    <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-3">
                            {streak > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-full font-bold text-sm">
                                    <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> {streak} day streak
                                </div>
                            )}
                            <button onClick={() => setIsOnboardingOpen(true)} className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition">
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-56 space-y-2">
                            <Bar label="Protein" val={consumedProt} target={proteinTarget} color="bg-emerald-500" />
                            <Bar label="Carbs" val={consumedCarb} target={carbsTarget} color="bg-amber-500" />
                            <Bar label="Fat" val={consumedFat} target={fatsTarget} color="bg-rose-500" />
                        </div>
                    </div>
                </div>

                {/* Quick nav links — below hero content */}
                <div className="relative z-10 flex items-center gap-3 mt-6 flex-wrap">
                    {[
                        { label: 'Workouts', href: '/workouts', icon: <Flame className="w-3.5 h-3.5" />, grad: 'from-rose-500 to-orange-500' },
                        { label: 'History', href: '/history', icon: <Calendar className="w-3.5 h-3.5" />, grad: 'from-indigo-500 to-violet-500' },
                        { label: 'Insights', href: '/insights', icon: <TrendingUp className="w-3.5 h-3.5" />, grad: 'from-sky-500 to-cyan-500' },
                        { label: 'Community', href: '/community', icon: <Users className="w-3.5 h-3.5" />, grad: 'from-emerald-500 to-teal-500' },
                    ].map(n => (
                        <Link key={n.label} href={n.href}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm font-semibold text-white hover:bg-white/20 transition-all active:scale-95 backdrop-blur-sm"
                        >
                            <div className={`bg-gradient-to-br ${n.grad} p-1 rounded-lg`}>{n.icon}</div>
                            {n.label} <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* ════════════════════════════════════════════════════
                MAIN 3-COLUMN GRID
            ════════════════════════════════════════════════════ */}
            <div className="px-6 py-6 grid grid-cols-12 gap-5">

                {/* ── LEFT COLUMN: Metrics (3/12) ── */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Daily Metrics</h2>

                    {/* Water */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                                    <Droplet className="w-4 h-4 text-sky-500 fill-sky-500" />
                                </div>
                                <span className="font-bold text-slate-800 dark:text-white text-sm">Water Intake</span>
                            </div>
                            <span className="text-xs font-black text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-2.5 py-1 rounded-full">{metrics.water_glasses}/8</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(g => (
                                <button key={g} onClick={() => updateMetric('water_glasses', g === metrics.water_glasses ? g - 1 : g)}
                                    className={`h-9 rounded-xl border-2 transition-all active:scale-90 text-xs font-bold ${g <= metrics.water_glasses ? 'bg-sky-400 border-sky-500 text-white shadow-sm shadow-sky-400/40' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-400'}`}>
                                    {g <= metrics.water_glasses ? '💧' : g}
                                </button>
                            ))}
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-400 rounded-full transition-all duration-500" style={{ width: `${(metrics.water_glasses / 8) * 100}%` }} />
                        </div>
                    </div>

                    {/* Sleep */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <Moon className="w-4 h-4 text-indigo-500" />
                                </div>
                                <span className="font-bold text-slate-800 dark:text-white text-sm">Sleep</span>
                            </div>
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">{(metrics.sleep_minutes / 60).toFixed(1)}h / 8h</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <RingProgress pct={Math.min(100, (metrics.sleep_minutes / 480) * 100)} size={64} stroke={6} color="#6366f1" bg="#e0e7ff">
                                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300">{Math.round((metrics.sleep_minutes / 480) * 100)}%</span>
                            </RingProgress>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hours</label>
                                    <input type="number" min="0" max="24"
                                        value={Math.floor(metrics.sleep_minutes / 60) || ''}
                                        placeholder="0"
                                        onChange={e => {
                                            const hrs = Math.max(0, parseInt(e.target.value) || 0);
                                            const mins = metrics.sleep_minutes % 60;
                                            updateMetric('sleep_minutes', hrs * 60 + mins);
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-black text-xl text-center text-slate-800 dark:text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Minutes</label>
                                    <input type="number" min="0" max="59"
                                        value={metrics.sleep_minutes % 60 || ''}
                                        placeholder="0"
                                        onChange={e => {
                                            const mins = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                                            const hrs = Math.floor(metrics.sleep_minutes / 60);
                                            updateMetric('sleep_minutes', hrs * 60 + mins);
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-black text-xl text-center text-slate-800 dark:text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition" />
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (metrics.sleep_minutes / 480) * 100)}%` }} />
                        </div>
                    </div>


                    {/* Steps */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <Footprints className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="font-bold text-slate-800 dark:text-white text-sm">Steps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {isStepSyncing && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
                                <button onClick={() => { setStepGoalInput(String(stepGoal)); setIsEditingStepGoal(true); }}
                                    className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition">
                                    Goal: {stepGoal.toLocaleString()}
                                </button>
                            </div>
                        </div>

                        {/* Step Goal Edit Inline */}
                        {isEditingStepGoal && (
                            <div className="mb-3 flex gap-2 items-center">
                                <input type="number" autoFocus min="100" max="100000"
                                    value={stepGoalInput}
                                    onChange={e => setStepGoalInput(e.target.value)}
                                    placeholder="Enter step goal"
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-emerald-300 rounded-xl px-3 py-2 font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-400/20 text-sm" />
                                <button onClick={() => {
                                    const g = Math.max(100, parseInt(stepGoalInput) || 10000);
                                    setStepGoal(g);
                                    localStorage.setItem('fitcore_step_goal', String(g));
                                    setIsEditingStepGoal(false);
                                }} className="px-3 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-400 transition">Save</button>
                                <button onClick={() => setIsEditingStepGoal(false)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-200 transition">Cancel</button>
                            </div>
                        )}

                        <input type="number" value={metrics.steps || ''} placeholder="0"
                            onChange={e => updateMetric('steps', parseInt(e.target.value) || 0)}
                            onBlur={e => analyzeSteps(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-black text-2xl text-slate-800 dark:text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition mb-2" />
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (metrics.steps / stepGoal) * 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                            <span>{metrics.steps.toLocaleString()} steps done</span>
                            <span>{Math.max(0, stepGoal - metrics.steps).toLocaleString()} to go</span>
                        </div>
                    </div>

                    {/* Active Burn */}
                    <Link href="/workouts" className="block bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl p-5 shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 group">
                        <div className="flex items-center gap-2 mb-3">
                            <Flame className="w-5 h-5 text-white fill-white" />
                            <span className="font-bold text-sm text-white">Active Burn</span>
                        </div>
                        <div className="text-3xl font-black text-white tracking-tighter">
                            <AnimNum value={metrics.workout_calories_burned || 0} />
                            <span className="text-base font-bold text-white/70 ml-1">kcal</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/70 text-xs font-semibold mt-3 group-hover:text-white transition">
                            Go to Workout Hub <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                    </Link>

                    {/* Weight Tracker */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                    <span className="text-sm">⚖️</span>
                                </div>
                                <span className="font-bold text-slate-800 dark:text-white text-sm">Weight</span>
                            </div>
                            {targetWeight > 0 && (
                                <span className="text-[10px] font-black text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1 rounded-full">
                                    Target: {targetWeight} kg
                                </span>
                            )}
                        </div>

                        {/* Current weight input */}
                        <div className="flex gap-2 mb-3">
                            <input type="number" min="20" max="300" step="0.1"
                                value={weightInput}
                                placeholder={currentWeight ? String(currentWeight) : '0.0'}
                                onChange={e => { setWeightInput(e.target.value); setWeightSaved(false); }}
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-black text-2xl text-slate-800 dark:text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition" />
                            <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl px-3 border border-slate-200 dark:border-slate-700">
                                <span className="text-xs font-bold text-slate-400">kg</span>
                            </div>
                        </div>

                        <button
                            disabled={isSavingWeight || !weightInput}
                            onClick={async () => {
                                const w = parseFloat(weightInput);
                                if (!w || w < 20 || w > 300) return;
                                setIsSavingWeight(true);
                                try {
                                    await axios.patch('/api/profile/weight', { weight_kg: w });
                                    setCurrentWeight(w);
                                    setWeightSaved(true);
                                    setTimeout(() => setWeightSaved(false), 3000);
                                } catch { }
                                setIsSavingWeight(false);
                            }}
                            className="w-full py-2.5 rounded-xl font-bold text-sm transition active:scale-95 flex items-center justify-center gap-2
                                       bg-violet-500 hover:bg-violet-400 text-white shadow-sm shadow-violet-500/20 disabled:opacity-50">
                            {isSavingWeight ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                weightSaved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> :
                                    'Save Weight'}
                        </button>

                        {/* Progress toward target */}
                        {targetWeight > 0 && currentWeight > 0 && (() => {
                            const startW = user.weight_kg || currentWeight;
                            const diff = startW - targetWeight;
                            const progress = diff <= 0 ? 100 : Math.max(0, Math.min(100, Math.round(((startW - currentWeight) / diff) * 100)));
                            const remaining = Math.max(0, currentWeight - targetWeight).toFixed(1);
                            return (
                                <div className="mt-3">
                                    <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                                        <span>{currentWeight} kg now</span>
                                        <span>{remaining} kg to goal</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-400 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium text-right mt-0.5">{progress}% to target</p>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* ── CENTER COLUMN: Meals (5/12) ── */}
                <div className="col-span-12 lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Nutrition</h2>
                        <span className="text-xs font-bold text-slate-500">{consumedCal.toLocaleString()} / {dailyGoal.toLocaleString()} kcal</span>
                    </div>

                    {mealCategories.map(cat => {
                        const cals = getCalType(cat.title);
                        const budget = getBudget(cat.title);
                        const pct = Math.min(100, Math.round((cals / budget) * 100));
                        const items = meals.filter(m => m.meal_type === cat.title);

                        return (
                            <div key={cat.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className={`h-0.5 bg-gradient-to-r ${cat.color}`} />
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg shadow-sm`}>
                                                {cat.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white text-[15px] leading-tight">{cat.title}</h3>
                                                <p className="text-xs text-slate-400 font-medium">{cals} / {budget} kcal {pct > 0 && `· ${pct}%`}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setActiveMealType(cat.title); setIsModalOpen(true); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition shadow-sm active:scale-95">
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </button>
                                    </div>

                                    {pct > 0 && (
                                        <div className="mb-3 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                        </div>
                                    )}

                                    {items.length > 0 ? (
                                        <div className="space-y-2">
                                            {items.map(meal => (
                                                <div key={meal.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-slate-800 dark:text-white text-sm truncate">{meal.food_description}</div>
                                                        <div className="flex gap-3 mt-0.5">
                                                            <span className="text-[11px] font-bold text-emerald-600">P {meal.protein}g</span>
                                                            <span className="text-[11px] font-bold text-amber-600">C {meal.carbs}g</span>
                                                            <span className="text-[11px] font-bold text-rose-500">F {meal.fats}g</span>
                                                        </div>
                                                    </div>
                                                    <span className="ml-3 shrink-0 font-black text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600">
                                                        {meal.calories} <span className="text-[10px] font-bold text-slate-400">kcal</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <button onClick={() => { setActiveMealType(cat.title); setIsModalOpen(true); }}
                                            className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-400 font-medium hover:border-slate-300 hover:text-slate-500 transition flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" /> {cat.icon} Log {cat.title}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── RIGHT COLUMN: Community Feed (4/12) ── */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Community Feed</h2>
                        <Link href="/community" className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition">
                            Full page <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Compose box */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
                        <div className="flex rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 gap-1 mb-3">
                            {(['post', 'question'] as const).map(t => (
                                <button key={t} onClick={() => setComposeType(t)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${composeType === t ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                                    {t === 'post' ? '📝 Post' : '❓ Ask a Question'}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {(user?.name?.[0] ?? 'U').toUpperCase()}
                            </div>
                            <input value={composeText} onChange={e => setComposeText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitPost()}
                                placeholder={composeType === 'question' ? 'What fitness question do you have?' : 'Share a tip or progress update...'}
                                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition" />
                            <button onClick={submitPost} disabled={!composeText.trim() || submittingPost}
                                className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition disabled:opacity-40 active:scale-90 shadow shadow-emerald-500/20 shrink-0">
                                {submittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Posts */}
                    {communityLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                    ) : communityPosts.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                            <div className="text-4xl mb-2">🌱</div>
                            <p className="font-bold text-slate-700 dark:text-white text-sm">No posts yet</p>
                            <p className="text-xs text-slate-400 mt-1">Be the first to share something!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {communityPosts.slice(0, 6).map(post => {
                                const lk = postLikes[post.id] ?? { liked: post.liked_by_me, count: post.likes_count };
                                return (
                                    <div key={post.id} className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4 hover:shadow-md transition-shadow ${post.type === 'question' ? 'border-violet-100 dark:border-violet-900/30' : 'border-slate-100 dark:border-slate-800'}`}>
                                        <div className="flex items-center gap-2.5 mb-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{post.user.avatar}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-bold text-sm text-slate-800 dark:text-white">{post.user.name}</span>
                                                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">{post.user.xp} XP</span>
                                                    {post.type === 'question' && <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-1.5 py-0.5 rounded-full">❓ Q</span>}
                                                </div>
                                                <span className="text-[10px] text-slate-400">{post.created_at}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3 line-clamp-3">{post.body}</p>
                                        <div className="flex items-center gap-4 pt-2 border-t border-slate-50 dark:border-slate-800">
                                            <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm font-semibold transition-all active:scale-90 ${lk.liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                                                <Heart className={`w-4 h-4 ${lk.liked ? 'fill-red-500' : ''}`} /> {lk.count}
                                            </button>
                                            <Link href="/community" className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-emerald-600 transition">
                                                <MessageCircle className="w-4 h-4" /> {post.comments_count} {post.type === 'question' ? 'answers' : 'replies'}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                            <Link href="/community" className="block text-center text-sm font-bold text-emerald-600 hover:text-emerald-700 py-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 transition hover:shadow-sm">
                                View all posts on Community page →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ════════════════════ MEAL LOG MODAL ════════════════════ */}
            <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-lg bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/30">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <Dialog.Title className="text-xl font-black text-slate-900 dark:text-white">Log {activeMealType}</Dialog.Title>
                                <Dialog.Description className="text-xs text-slate-400">Smart nutrition analysis — calculates macros automatically</Dialog.Description>
                            </div>
                        </div>
                        {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-sm mb-4 font-semibold border border-red-100">{errorMsg}</div>}
                        <div className="relative">
                            <textarea className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-700 dark:text-slate-200 resize-none text-sm" placeholder="e.g., 200g grilled chicken, large bowl of rice and steamed broccoli" value={foodText} onChange={e => setFoodText(e.target.value)} disabled={isAiLoading} />
                            {isAiLoading && (
                                <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                                    <span className="text-emerald-700 font-black text-xs tracking-widest animate-pulse">ANALYZING...</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Dialog.Close asChild><button disabled={isAiLoading} className="flex-1 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700">Cancel</button></Dialog.Close>
                            <button onClick={logMeal} disabled={isAiLoading || !foodText.trim()} className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/30 hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50 flex items-center justify-center gap-2">
                                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Analyze & Log Food
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* ════════════════════ GOALS MODAL ════════════════════ */}
            <Dialog.Root open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
                <Dialog.Portal>

                    {/* 🌌 BACKGROUND */}
                    <Dialog.Overlay className="fixed inset-0 bg-gradient-to-br from-indigo-900/60 via-black/70 to-purple-900/60 backdrop-blur-md z-50" />

                    {/* 💎 LIQUID GLASS + 3D MODAL */}
                    <Dialog.Content
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            transform: `translate(-50%, -50%) perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                        }}
                        className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-lg 
      backdrop-blur-2xl bg-white/10 dark:bg-white/5 
      border border-white/20 
      rounded-3xl 
      shadow-[0_8px_32px_rgba(0,0,0,0.37)] 
      px-6 py-8 overflow-y-auto max-h-[90vh] 
      transition-all duration-300 
      hover:shadow-[0_0_60px_rgba(99,102,241,0.4)]
      relative">

                        {/* 🌈 ANIMATED GRADIENT */}
                        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                            <div className="absolute w-[200%] h-[200%] 
          bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 
          animate-liquid blur-3xl opacity-30">
                            </div>
                        </div>

                        {/* ✨ LIGHT BLOBS */}
                        <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
                            <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/20 blur-3xl opacity-30"></div>
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-400/20 blur-2xl"></div>
                        </div>

                        {/* HEADER */}
                        <div className="flex items-center gap-3 mb-5 relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-md">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <Dialog.Title className="text-2xl font-black text-white">
                                    Your Goals
                                </Dialog.Title>
                                <Dialog.Description className="text-sm text-white/60">
                                    AI-calculated daily targets
                                </Dialog.Description>
                            </div>
                        </div>

                        {/* ERROR */}
                        {onboardError && (
                            <div className="bg-red-500/20 text-red-300 p-3 rounded-2xl mb-4">
                                {onboardError}
                            </div>
                        )}

                        {/* GENDER */}
                        <div className="flex rounded-2xl border border-white/20 bg-white/5 p-1.5 gap-1.5 mb-5 relative z-10">
                            {(['male', 'female']).map(g => (
                                <button
                                    key={g}
                                    onClick={() => setOnboardForm(f => ({ ...f, gender: g }))}
                                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition 
            ${onboardForm.gender === g
                                            ? 'bg-white/20 text-white'
                                            : 'text-white/40'}`}
                                >
                                    {g === 'male' ? '♂ Male' : '♀ Female'}
                                </button>
                            ))}
                        </div>

                        {/* INPUTS */}
                        <div className="grid grid-cols-2 gap-3 mb-3 relative z-10">
                            {[
                                { label: 'Age', key: 'age', val: onboardForm.age },
                                { label: 'Height', key: 'height_cm', val: onboardForm.height_cm },
                                { label: 'Weight', key: 'weight_kg', val: onboardForm.weight_kg },
                                { label: 'Target', key: 'target_weight_kg', val: onboardForm.target_weight_kg },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="text-xs text-white/50">{f.label}</label>

                                    <input
                                        type="number"
                                        value={f.val}
                                        onChange={e => {
                                            const value = e.target.value;
                                            setOnboardForm(p => ({
                                                ...p,
                                                [f.key]: value === "" ? "" : parseInt(value)
                                            }));
                                        }}
                                        className="w-full bg-white/10 backdrop-blur-xl 
              border border-white/20 rounded-2xl px-4 py-3 
              text-white focus:ring-2 focus:ring-indigo-400"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* TIMELINE */}
                        <input
                            type="number"
                            value={onboardForm.target_months}
                            onChange={e => {
                                const value = e.target.value;
                                setOnboardForm(f => ({
                                    ...f,
                                    target_months: value === "" ? "" : parseInt(value)
                                }));
                            }}
                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white mb-4"
                        />

                        {/* BUTTON */}
                        <button
                            onClick={submitOnboarding}
                            className="relative w-full py-4 rounded-2xl font-bold text-white 
        bg-gradient-to-r from-indigo-500/60 to-violet-600/60 
        border border-white/20 overflow-hidden">

                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isOnboardingLoading ? "Loading..." : "Set Goals"}
                            </span>

                            <span className="absolute inset-0 bg-white/20 blur-2xl opacity-20"></span>
                        </button>

                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </AppLayout>
    );
}
