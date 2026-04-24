import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft, ChevronDown, ArrowRight, BarChart3, Activity,
    Flame, Beef, Wheat, Droplet, TrendingUp, Calendar,
} from 'lucide-react';
import {
    XAxis, YAxis,
    ResponsiveContainer, ReferenceLine, Tooltip,
    AreaChart, Area,
} from 'recharts';

/* ─── Neumorphism palette tokens ─────────────────────────────── */
const NEU_BG    = '#e8edf2';
const NEU_DARK  = '#c8cfd8';
const NEU_LIGHT = '#ffffff';

interface PageProps {
    auth: { user: any };
    targetDate: string;
    mealsOnDate: any[];
    aggregates: { calories: number; protein: number; carbs: number; fats: number };
    weeklyTrends: {
        date: string; short_day: string; day_num: string;
        calories: number; protein: number; carbs: number; fats: number;
    }[];
}

const TABS = ['All Meals', 'Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];

/* ── Reusable neumorphic card ── */
function NeuCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-3xl p-6 ${className}`}
            style={{
                background: NEU_BG,
                boxShadow: `8px 8px 20px ${NEU_DARK}, -8px -8px 20px ${NEU_LIGHT}`,
            }}
        >
            {children}
        </div>
    );
}

/* ── Inset (pressed) neu card ── */
function NeuInset({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-2xl ${className}`}
            style={{
                background: NEU_BG,
                boxShadow: `inset 5px 5px 12px ${NEU_DARK}, inset -5px -5px 12px ${NEU_LIGHT}`,
            }}
        >
            {children}
        </div>
    );
}

/* ── Neumorphic ring progress ── */
function NeuRing({ pct, size = 100, color, label, sublabel }: {
    pct: number; size?: number; color: string; label: string; sublabel?: string;
}) {
    const r = (size / 2) - 10;
    const circ = 2 * Math.PI * r;
    const offset = circ - (circ * Math.min(100, pct)) / 100;
    return (
        <div className="flex flex-col items-center gap-1">
            <div
                className="rounded-full flex items-center justify-center relative"
                style={{
                    width: size, height: size,
                    background: NEU_BG,
                    boxShadow: `6px 6px 14px ${NEU_DARK}, -6px -6px 14px ${NEU_LIGHT}`,
                }}
            >
                <svg width={size} height={size} className="absolute inset-0 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="transparent"
                        stroke={NEU_DARK} strokeWidth="7" />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="transparent"
                        stroke={color} strokeWidth="7"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                </svg>
                <div className="relative z-10 text-center">
                    <div className="font-black text-slate-700 text-sm leading-none">{label}</div>
                    {sublabel && <div className="text-[10px] font-bold text-slate-400 mt-0.5">{sublabel}</div>}
                </div>
            </div>
        </div>
    );
}

/* ── Macro bar row ── */
function MacroRow({ icon, name, value, target, pct, color }: {
    icon: React.ReactNode; name: string; value: number; target: number; pct: number; color: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: NEU_BG, boxShadow: `3px 3px 8px ${NEU_DARK}, -3px -3px 8px ${NEU_LIGHT}` }}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                    <span>{name}</span>
                    <span className="text-slate-700">{value}g <span className="font-normal text-slate-400">/ {target}g</span></span>
                </div>
                <NeuInset className="w-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }} />
                </NeuInset>
            </div>
            <span className="text-xs font-black w-10 text-right" style={{ color }}>
                {Math.round(pct)}%
            </span>
        </div>
    );
}

export default function Insights() {
    const { auth, targetDate, mealsOnDate, weeklyTrends } = usePage().props as unknown as PageProps;
    const user = auth.user;

    const [activeTab, setActiveTab]   = useState('All Meals');
    const [trendType, setTrendType]   = useState('calories');

    const dailyGoal  = user.daily_calorie_target || 2000;
    const targets    = {
        protein: user.daily_protein_target || 150,
        carbs:   user.daily_carbs_target   || 200,
        fats:    user.daily_fats_target    || 65,
    };

    const filtered = activeTab === 'All Meals'
        ? mealsOnDate
        : mealsOnDate.filter(m => m.meal_type === activeTab);

    const agg = {
        calories: filtered.reduce((a, m) => a + m.calories, 0),
        protein:  filtered.reduce((a, m) => a + m.protein,  0),
        carbs:    filtered.reduce((a, m) => a + m.carbs,    0),
        fats:     filtered.reduce((a, m) => a + m.fats,     0),
    };

    const tabGoal   = activeTab === 'All Meals' ? dailyGoal
        : (activeTab.includes('Snack') ? dailyGoal * 0.08 : dailyGoal * 0.28);
    const calPct    = Math.min(100, Math.round((agg.calories / tabGoal) * 100));

    const macroGoal = (base: number) => Math.round(
        activeTab === 'All Meals' ? base
            : base * (activeTab.includes('Snack') ? 0.1 : 0.3)
    );

    const weeklyTotal = weeklyTrends.reduce((a, d) => a + d.calories, 0);
    const avgPerDay   = Math.round(weeklyTotal / 7);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        router.get('/insights', { date: e.target.value }, { preserveState: true });

    const d = new Date(targetDate);
    const headerTitle = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} Insights`;

    /* ── Calorie face state ── */
    const face = calPct === 0   ? { emoji: '😴', msg: "Nothing tracked yet — log a meal to see insights!" }
        : calPct < 60           ? { emoji: '😊', msg: "Great start! Keep building on this." }
        : calPct <= 100         ? { emoji: '🎯', msg: "Perfect pace! You're on target." }
        :                         { emoji: '⚠️', msg: "You've exceeded today's calorie budget." };

    const trendOptions = [
        { key: 'calories', label: 'Calories', color: '#6366f1' },
        { key: 'protein',  label: 'Protein',  color: '#0ea5e9' },
        { key: 'carbs',    label: 'Carbs',    color: '#f59e0b' },
        { key: 'fats',     label: 'Fats',     color: '#f43f5e' },
    ];
    const activeTrend = trendOptions.find(t => t.key === trendType) || trendOptions[0];

    return (
        <div className="min-h-screen pb-20" style={{ background: NEU_BG }}>
            <Head title="Insights" />

            {/* ── STICKY HEADER ── */}
            <div className="sticky top-0 z-30 px-4 py-3"
                style={{ background: NEU_BG, boxShadow: `0 4px 12px ${NEU_DARK}` }}>
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <Link href="/dashboard"
                        className="w-10 h-10 rounded-2xl flex items-center justify-center transition"
                        style={{ boxShadow: `4px 4px 10px ${NEU_DARK}, -4px -4px 10px ${NEU_LIGHT}` }}>
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>

                    {/* Date picker */}
                    <div className="flex-1 relative flex items-center justify-center">
                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl cursor-pointer"
                            style={{ boxShadow: `inset 3px 3px 8px ${NEU_DARK}, inset -3px -3px 8px ${NEU_LIGHT}` }}>
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="font-bold text-slate-700 text-sm">{headerTitle}</span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </div>
                        <input type="date"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                            value={targetDate} onChange={handleDateChange} />
                    </div>

                    <Link href="/dashboard"
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ boxShadow: `4px 4px 10px ${NEU_DARK}, -4px -4px 10px ${NEU_LIGHT}` }}>
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                    </Link>
                </div>

                {/* Tabs */}
                <div className="max-w-3xl mx-auto mt-3 flex overflow-x-auto scrollbar-hide gap-2 pb-1">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className="whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-bold transition-all"
                            style={activeTab === tab ? {
                                background: '#6366f1',
                                color: '#fff',
                                boxShadow: `3px 3px 8px ${NEU_DARK}`,
                            } : {
                                background: NEU_BG,
                                color: '#64748b',
                                boxShadow: `3px 3px 8px ${NEU_DARK}, -3px -3px 8px ${NEU_LIGHT}`,
                            }}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

                {/* ── HERO CALORIE CARD ── */}
                <NeuCard>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Calorie Budget</p>
                            <h2 className="text-3xl font-black text-slate-800">{agg.calories.toLocaleString()}
                                <span className="text-lg font-bold text-slate-400 ml-1">/ {Math.round(tabGoal)}</span>
                            </h2>
                        </div>
                        <div className="text-5xl">{face.emoji}</div>
                    </div>

                    {/* Big progress bar */}
                    <NeuInset className="w-full h-6 overflow-hidden mb-3">
                        <div className="h-full rounded-full transition-all duration-1000"
                            style={{
                                width: `${calPct}%`,
                                background: calPct > 100 ? '#f43f5e'
                                    : calPct < 60       ? '#10b981'
                                    :                     '#6366f1',
                            }} />
                    </NeuInset>

                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-slate-500">{face.msg}</p>
                        <span className="text-2xl font-black text-slate-700">{calPct}%</span>
                    </div>
                </NeuCard>

                {/* ── 4 STAT RINGS ── */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { icon: <Flame className="w-4 h-4 text-rose-500" />, label: `${agg.calories}`, sub: 'kcal', pct: calPct, color: '#f43f5e' },
                        { icon: <Beef className="w-4 h-4 text-sky-500" />,   label: `${agg.protein}g`, sub: 'protein', pct: Math.min(100, (agg.protein / macroGoal(targets.protein)) * 100), color: '#0ea5e9' },
                        { icon: <Wheat className="w-4 h-4 text-amber-500" />, label: `${agg.carbs}g`, sub: 'carbs', pct: Math.min(100, (agg.carbs / macroGoal(targets.carbs)) * 100), color: '#f59e0b' },
                        { icon: <Droplet className="w-4 h-4 text-emerald-500" />, label: `${agg.fats}g`, sub: 'fats', pct: Math.min(100, (agg.fats / macroGoal(targets.fats)) * 100), color: '#10b981' },
                    ].map((s, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <NeuRing pct={s.pct} size={80} color={s.color} label={s.label} sublabel={s.sub} />
                        </div>
                    ))}
                </div>

                {/* ── MACROS BREAKDOWN ── */}
                <NeuCard>
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: NEU_BG, boxShadow: `3px 3px 8px ${NEU_DARK}, -3px -3px 8px ${NEU_LIGHT}` }}>
                            <Activity className="w-4 h-4 text-indigo-500" />
                        </div>
                        <h3 className="font-black text-slate-700">Macronutrients</h3>
                    </div>
                    <div className="space-y-5">
                        <MacroRow icon={<Beef className="w-4 h-4 text-sky-500" />}
                            name="Protein" value={agg.protein} target={macroGoal(targets.protein)}
                            pct={Math.min(100, (agg.protein / Math.max(1, macroGoal(targets.protein))) * 100)}
                            color="#0ea5e9" />
                        <MacroRow icon={<Wheat className="w-4 h-4 text-amber-500" />}
                            name="Carbohydrates" value={agg.carbs} target={macroGoal(targets.carbs)}
                            pct={Math.min(100, (agg.carbs / Math.max(1, macroGoal(targets.carbs))) * 100)}
                            color="#f59e0b" />
                        <MacroRow icon={<Droplet className="w-4 h-4 text-emerald-500" />}
                            name="Fats" value={agg.fats} target={macroGoal(targets.fats)}
                            pct={Math.min(100, (agg.fats / Math.max(1, macroGoal(targets.fats))) * 100)}
                            color="#10b981" />
                    </div>
                </NeuCard>

                {/* ── WEEKLY TREND ── */}
                <NeuCard>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: NEU_BG, boxShadow: `3px 3px 8px ${NEU_DARK}, -3px -3px 8px ${NEU_LIGHT}` }}>
                                <BarChart3 className="w-4 h-4 text-indigo-500" />
                            </div>
                            <h3 className="font-black text-slate-700">7-Day Trends</h3>
                        </div>
                        {/* Trend type pills */}
                        <div className="flex gap-1.5">
                            {trendOptions.map(t => (
                                <button key={t.key} onClick={() => setTrendType(t.key)}
                                    className="px-3 py-1 rounded-full text-[11px] font-black transition-all"
                                    style={trendType === t.key ? {
                                        background: t.color, color: '#fff',
                                        boxShadow: `2px 2px 6px ${NEU_DARK}`,
                                    } : {
                                        background: NEU_BG, color: '#64748b',
                                        boxShadow: `2px 2px 6px ${NEU_DARK}, -2px -2px 6px ${NEU_LIGHT}`,
                                    }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                            { label: 'Weekly Total', value: weeklyTotal.toLocaleString(), unit: 'kcal' },
                            { label: 'Daily Average', value: avgPerDay.toLocaleString(), unit: 'kcal/day' },
                        ].map(s => (
                            <NeuInset key={s.label} className="p-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                                <p className="text-xl font-black text-slate-700">{s.value}
                                    <span className="text-xs font-bold text-slate-400 ml-1">{s.unit}</span>
                                </p>
                            </NeuInset>
                        ))}
                    </div>

                    {/* Area chart */}
                    <NeuInset className="p-4">
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyTrends} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={activeTrend.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={activeTrend.color} stopOpacity={0}   />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="0" stroke={NEU_DARK} vertical={false} />
                                    <XAxis dataKey="short_day" axisLine={false} tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                        domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{
                                            background: NEU_BG,
                                            border: 'none',
                                            borderRadius: '16px',
                                            boxShadow: `4px 4px 12px ${NEU_DARK}, -4px -4px 12px ${NEU_LIGHT}`,
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                        }}
                                        itemStyle={{ color: activeTrend.color }}
                                        cursor={{ stroke: activeTrend.color, strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    {trendType === 'calories' && (
                                        <ReferenceLine y={dailyGoal} stroke="#f87171" strokeDasharray="3 3"
                                            label={{ value: 'goal', position: 'insideTopRight', fontSize: 10, fill: '#f87171' }} />
                                    )}
                                    <Area type="monotone" dataKey={trendType}
                                        stroke={activeTrend.color} strokeWidth={2.5}
                                        fill="url(#trendGrad)"
                                        dot={{ r: 4, fill: NEU_BG, stroke: activeTrend.color, strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: activeTrend.color }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </NeuInset>
                </NeuCard>

                {/* ── MEAL LIST ── */}
                {filtered.length > 0 && (
                    <NeuCard>
                        <h3 className="font-black text-slate-700 mb-4">Meals Logged</h3>
                        <div className="space-y-3">
                            {filtered.map((meal: any) => (
                                <NeuInset key={meal.id} className="flex items-center gap-3 p-4">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                                        style={{ background: NEU_BG, boxShadow: `3px 3px 8px ${NEU_DARK}, -3px -3px 8px ${NEU_LIGHT}` }}>
                                        {meal.meal_type.includes('Snack') ? '🍎' : meal.meal_type === 'Breakfast' ? '🍳' : meal.meal_type === 'Lunch' ? '🥗' : meal.meal_type === 'Dinner' ? '🍽️' : '🥘'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-700 text-sm truncate">{meal.food_description}</p>
                                        <p className="text-xs font-medium text-slate-400">{meal.meal_type}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-black text-slate-700 text-sm">{meal.calories} kcal</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{meal.protein}g P · {meal.carbs}g C · {meal.fats}g F</p>
                                    </div>
                                </NeuInset>
                            ))}
                        </div>
                    </NeuCard>
                )}

                {/* ── EMPTY STATE ── */}
                {agg.calories === 0 && (
                    <NeuCard className="text-center">
                        <div className="text-6xl mb-4">🥗</div>
                        <h3 className="font-black text-slate-700 text-xl mb-2">Nothing tracked yet</h3>
                        <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                            Log a meal on the dashboard to see your insights, macros breakdown, and weekly trends come to life.
                        </p>
                        <Link href="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-indigo-600 transition"
                            style={{ background: NEU_BG, boxShadow: `5px 5px 12px ${NEU_DARK}, -5px -5px 12px ${NEU_LIGHT}` }}>
                            Track Your Meals <ArrowRight className="w-4 h-4" />
                        </Link>
                    </NeuCard>
                )}
            </div>
        </div>
    );
}
