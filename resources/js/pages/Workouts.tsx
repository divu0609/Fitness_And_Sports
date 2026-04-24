import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    ChevronRight, ArrowLeft, Search, X, Activity, Loader2, Plus,
    Calendar, Flame, CheckCircle2, AlertCircle, ChevronDown, Zap,
} from 'lucide-react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

/* ── All supported exercise definitions ── */
const ALL_EXERCISES = [
    {
        name: 'Walking',        emoji: '🚶', category: 'Cardio',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '30' },
            { key: 'speed_kmh',        label: 'Speed',    unit: 'km/h', type: 'number', placeholder: '5' },
        ],
    },
    {
        name: 'Running',        emoji: '🏃', category: 'Cardio',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min',  type: 'number', placeholder: '20' },
            { key: 'speed_kmh',        label: 'Speed',    unit: 'km/h', type: 'number', placeholder: '10' },
        ],
    },
    {
        name: 'Cycling',        emoji: '🚴', category: 'Cardio',
        fields: [
            { key: 'duration_minutes', label: 'Duration',    unit: 'min',  type: 'number', placeholder: '45' },
            { key: 'speed_kmh',        label: 'Avg Speed',   unit: 'km/h', type: 'number', placeholder: '20' },
        ],
    },
    {
        name: 'Swimming',       emoji: '🏊', category: 'Cardio',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min',  type: 'number', placeholder: '30' },
            { key: 'laps',             label: 'Laps',     unit: 'laps', type: 'number', placeholder: '20' },
        ],
    },
    {
        name: 'Weightlifting',  emoji: '🏋️', category: 'Strength',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '45' },
            { key: 'sets',             label: 'Sets',     unit: '',    type: 'number', placeholder: '4'  },
        ],
    },
    {
        name: 'Yoga',           emoji: '🧘', category: 'Flexibility',
        fields: [
            { key: 'duration_minutes', label: 'Duration',   unit: 'min', type: 'number', placeholder: '60' },
            { key: 'intensity',        label: 'Intensity',  unit: '',    type: 'select', options: ['gentle', 'moderate', 'power'], placeholder: 'moderate' },
        ],
    },
    {
        name: 'HIIT',           emoji: '⚡', category: 'Cardio',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '20' },
            { key: 'rounds',           label: 'Rounds',   unit: '',    type: 'number', placeholder: '8'  },
        ],
    },
    {
        name: 'Jump Rope',      emoji: '🪢', category: 'Cardio',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '15' },
        ],
    },
    {
        name: 'Rowing',         emoji: '🚣', category: 'Cardio',
        fields: [
            { key: 'duration_minutes', label: 'Duration',  unit: 'min', type: 'number', placeholder: '30' },
            { key: 'distance_m',       label: 'Distance',  unit: 'm',   type: 'number', placeholder: '5000' },
        ],
    },
    {
        name: 'Boxing',         emoji: '🥊', category: 'Strength',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '30' },
            { key: 'rounds',           label: 'Rounds',   unit: '',    type: 'number', placeholder: '6'  },
        ],
    },
    {
        name: 'Pilates',        emoji: '🤸', category: 'Flexibility',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '45' },
        ],
    },
    {
        name: 'Rock Climbing',  emoji: '🧗', category: 'Strength',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '60' },
            { key: 'routes',           label: 'Routes',   unit: '',    type: 'number', placeholder: '5'  },
        ],
    },
    {
        name: 'Dancing',        emoji: '💃', category: 'Cardio',
        fields: [
            { key: 'duration_minutes', label: 'Duration',  unit: 'min', type: 'number', placeholder: '30' },
            { key: 'intensity',        label: 'Intensity', unit: '',    type: 'select', options: ['slow', 'moderate', 'intense'], placeholder: 'moderate' },
        ],
    },
    {
        name: 'Basketball',     emoji: '🏀', category: 'Sport',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '40' },
        ],
    },
    {
        name: 'Football',       emoji: '⚽', category: 'Sport',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '90' },
        ],
    },
    {
        name: 'Tennis',         emoji: '🎾', category: 'Sport',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '60' },
            { key: 'sets',             label: 'Sets',     unit: '',    type: 'number', placeholder: '3'  },
        ],
    },
    {
        name: 'Badminton',      emoji: '🏸', category: 'Sport',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '45' },
        ],
    },
    {
        name: 'Stair Climbing', emoji: '🪜', category: 'Cardio',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min',   type: 'number', placeholder: '20' },
            { key: 'floors',           label: 'Floors',   unit: 'floors', type: 'number', placeholder: '15' },
        ],
    },
    {
        name: 'Stretching',     emoji: '🦵', category: 'Flexibility',
        fields: [
            { key: 'duration_minutes', label: 'Duration', unit: 'min', type: 'number', placeholder: '20' },
        ],
    },
    {
        name: 'Other Exercise', emoji: '🏅', category: 'Other',
        fields: [
            { key: 'duration_minutes', label: 'Duration',    unit: 'min', type: 'number', placeholder: '30' },
            { key: 'intensity',        label: 'Intensity',   unit: '',    type: 'select', options: ['light', 'moderate', 'vigorous'], placeholder: 'moderate' },
        ],
    },
];

/* ── Levenshtein distance for fuzzy match ── */
function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0).map((_, j) => j === 0 ? i : 0));
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
        }
    }
    return dp[m][n];
}

function fuzzySearch(query: string) {
    if (!query.trim()) return ALL_EXERCISES.slice(0, 8);
    const q = query.toLowerCase();
    const scored = ALL_EXERCISES.map(ex => {
        const name = ex.name.toLowerCase();
        const exact = name.includes(q) ? 0 : Infinity;
        const dist  = levenshtein(q, name.substring(0, q.length));
        return { ex, score: exact === 0 ? 0 : dist };
    });
    return scored
        .filter(s => s.score <= 3 || s.ex.name.toLowerCase().includes(q))
        .sort((a, b) => a.score - b.score)
        .map(s => s.ex);
}

const CATEGORY_COLORS: Record<string, string> = {
    Cardio: 'bg-rose-100 text-rose-700',
    Strength: 'bg-amber-100 text-amber-700',
    Flexibility: 'bg-violet-100 text-violet-700',
    Sport: 'bg-sky-100 text-sky-700',
    Other: 'bg-slate-100 text-slate-600',
};

export default function Workouts({ auth }: any) {
    const user = auth.user;
    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Workouts', href: '/workouts' },
    ];

    const [metrics, setMetrics] = useState({ workout_calories_burned: 0 });
    const targetBurn = user.daily_active_burn_target || 400;

    const [historyData, setHistoryData] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    /* ── Modal state ── */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<typeof ALL_EXERCISES[0] | null>(null);
    /* Dynamic field values keyed by field.key */
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [aiResult, setAiResult] = useState<number | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const getClientDate = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    };

    useEffect(() => {
        axios.get('/api/metrics', { params: { client_date: getClientDate() } })
            .then(res => { if (res.data.metrics) setMetrics(res.data.metrics); })
            .catch(() => {});

        axios.get('/api/metrics/history')
            .then(res => {
                if (res.data.success) {
                    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                    setHistoryData(res.data.history.map((item: any) => {
                        const d = new Date(item.date);
                        return { name: days[d.getDay()], dateDisplay: d.getDate(), calories: item.workout_calories_burned || 0 };
                    }));
                }
            })
            .catch(() => {})
            .finally(() => setIsHistoryLoading(false));
    }, []);

    const openModal = () => {
        setIsModalOpen(true);
        setSelectedExercise(null);
        setSearchQuery('');
        setFieldValues({});
        setAiError('');
        setAiResult(null);
        setTimeout(() => searchRef.current?.focus(), 100);
    };

    const selectExercise = (ex: typeof ALL_EXERCISES[0]) => {
        setSelectedExercise(ex);
        setFieldValues({});
        setAiError('');
        setAiResult(null);
    };

    const handleTrackActivity = async () => {
        if (!selectedExercise) return;
        const durationField = selectedExercise.fields.find(f => f.key === 'duration_minutes');
        const duration = parseInt(fieldValues['duration_minutes'] || '0');
        if (durationField && (!duration || duration <= 0)) {
            setAiError('Please enter a valid duration.');
            return;
        }

        setIsAiLoading(true);
        setAiError('');
        setAiResult(null);

        // Build a detailed description for the AI incorporating all field values
        const extraDetails = selectedExercise.fields
            .filter(f => f.key !== 'duration_minutes' && fieldValues[f.key])
            .map(f => `${f.label}: ${fieldValues[f.key]} ${f.unit}`)
            .join(', ');

        const activityDesc = extraDetails
            ? `${selectedExercise.name} (${extraDetails})`
            : selectedExercise.name;

        try {
            const res = await axios.post('/api/metrics/analyze-activity', {
                activity_name: activityDesc,
                duration_minutes: duration || 30,
            });

            if (res.data.success) {
                const burned = res.data.calories_burned;
                setAiResult(burned);

                const newTotal = (metrics.workout_calories_burned || 0) + burned;
                await axios.post('/api/metrics', {
                    client_date: getClientDate(),
                    field: 'workout_calories_burned',
                    value: newTotal,
                });
                setMetrics(p => ({ ...p, workout_calories_burned: newTotal }));
            } else {
                setAiError(res.data.error || 'Could not calculate. Please try again.');
            }
        } catch (err: any) {
            const detail = err.response?.data?.details || err.response?.data?.error || '';
            setAiError(`Could not calculate${detail ? ': ' + detail : '. Please try again.'}` );
        }
        setIsAiLoading(false);
    };

    const pct = Math.min(100, Math.round(((metrics.workout_calories_burned || 0) / targetBurn) * 100));
    const filteredExercises = fuzzySearch(searchQuery);
    const showSuggestion = searchQuery.length > 1 && filteredExercises.length > 0 && filteredExercises[0].name.toLowerCase() !== searchQuery.toLowerCase();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workouts" />

            {/* ══════════════════════════════════════
                HERO HEADER
            ══════════════════════════════════════ */}
            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white px-8 py-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <div>
                        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-3 text-sm font-medium">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <h1 className="text-3xl font-black tracking-tight">Workout Hub 🏋️</h1>
                        <p className="text-slate-400 text-sm mt-1">Track your active burn — AI calculates for you</p>
                    </div>

                    {/* Ring */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-36 h-36">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="44" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                                <circle cx="50" cy="50" r="44" fill="transparent" stroke="#f43f5e" strokeWidth="8"
                                    strokeDasharray="276" strokeDashoffset={276 - (276 * pct) / 100}
                                    strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black">{metrics.workout_calories_burned || 0}</span>
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">of {targetBurn}</span>
                                <span className="text-[9px] font-bold text-rose-400 mt-0.5">kcal burned</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={openModal}
                        className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-rose-500/30 transition active:scale-95">
                        <Plus className="w-5 h-5" /> Track Workout
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════
                MAIN CONTENT — 2 columns
            ══════════════════════════════════════ */}
            <div className="px-6 py-6 grid grid-cols-12 gap-5 max-w-7xl mx-auto">

                {/* 7-day chart */}
                <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold text-slate-800 dark:text-white">7-Day Burn History</h2>
                        <span className="text-xs font-bold text-slate-400">Goal: {targetBurn} kcal/day</span>
                    </div>
                    <div className="h-48">
                        {isHistoryLoading ? (
                            <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historyData}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <YAxis hide domain={[0, Math.max(targetBurn * 1.5, 100)]} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                                    <ReferenceLine y={targetBurn} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'goal', position: 'insideTopLeft', fontSize: 10, fill: '#94a3b8' }} />
                                    <Line type="monotone" dataKey="calories" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#f43f5e' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Quick tips */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-rose-500/20">
                        <Flame className="w-6 h-6 mb-2" />
                        <h3 className="font-black text-lg">Today's Burn</h3>
                        <div className="text-4xl font-black mt-1">{metrics.workout_calories_burned || 0}</div>
                        <p className="text-white/70 text-sm mt-1">of {targetBurn} kcal goal · {pct}% complete</p>
                        <div className="mt-3 w-full h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Fitness Tip</h3>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">Willpower is a muscle. The more you use it, the stronger it gets. Never skip a workout — even 10 minutes counts!</p>
                    </div>
                </div>

                {/* Exercise library */}
                <div className="col-span-12 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h2 className="font-bold text-slate-800 dark:text-white mb-4">Exercise Library</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {ALL_EXERCISES.map(ex => (
                            <button key={ex.name} onClick={() => { openModal(); setTimeout(() => selectExercise(ex), 50); }}
                                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition group">
                                <span className="text-3xl">{ex.emoji}</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{ex.name}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[ex.category]}`}>{ex.category}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
                TRACK WORKOUT MODAL
            ══════════════════════════════════════ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

                        {/* Modal header */}
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            {selectedExercise ? (
                                <button onClick={() => setSelectedExercise(null)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition">
                                    <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                </button>
                            ) : (
                                <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition">
                                    <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                </button>
                            )}
                            {!selectedExercise ? (
                                <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700">
                                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                    <input ref={searchRef} type="text" placeholder="Search any exercise..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400"
                                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
                                    {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5 text-slate-400" /></button>}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{selectedExercise.emoji}</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{selectedExercise.name}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[selectedExercise.category]}`}>{selectedExercise.category}</span>
                                </div>
                            )}
                            <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition ml-auto shrink-0">
                                <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[70vh]">
                            {!selectedExercise ? (
                                /* ── Exercise list ── */
                                <div>
                                    {/* Spelling suggestion */}
                                    {showSuggestion && searchQuery.length > 2 && (
                                        <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 flex items-center gap-2 text-sm">
                                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span className="text-amber-700 dark:text-amber-400 font-medium">
                                                Did you mean <button className="font-black underline" onClick={() => setSearchQuery(filteredExercises[0].name)}>{filteredExercises[0].name}</button>?
                                            </span>
                                        </div>
                                    )}

                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                                        {searchQuery ? `Results for "${searchQuery}"` : 'Frequently Tracked'}
                                    </p>

                                    <div className="space-y-1">
                                        {filteredExercises.map(ex => (
                                            <button key={ex.name} onClick={() => selectExercise(ex)}
                                                className="w-full flex items-center gap-4 py-3.5 px-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group text-left">
                                                <span className="text-2xl">{ex.emoji}</span>
                                                <div className="flex-1">
                                                    <span className="font-semibold text-slate-800 dark:text-white text-[15px]">{ex.name}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[ex.category]}`}>{ex.category}</span>
                                                        <span className="text-[11px] text-slate-400">{ex.fields.map(f => f.label).join(' · ')}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition" />
                                            </button>
                                        ))}
                                        {filteredExercises.length === 0 && (
                                            <div className="text-center py-8 text-slate-400">
                                                <p className="font-bold">No exercise found</p>
                                                <p className="text-sm mt-1">Try a different spelling</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* ── Exercise input form ── */
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                                        Fill in your workout details — FitCore will calculate your exact calorie burn based on your body metrics.
                                    </p>

                                    <div className="space-y-4">
                                        {selectedExercise.fields.map(field => (
                                            <div key={field.key}>
                                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                                    {field.label} {field.unit && <span className="normal-case font-normal">({field.unit})</span>}
                                                </label>
                                                {field.type === 'select' ? (
                                                    <select value={fieldValues[field.key] || ''}
                                                        onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-rose-400 transition">
                                                        <option value="">Select {field.label.toLowerCase()}</option>
                                                        {field.options?.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                                                    </select>
                                                ) : (
                                                    <input type="number" min="0"
                                                        value={fieldValues[field.key] || ''}
                                                        placeholder={field.placeholder}
                                                        onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))}
                                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-black text-2xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Result */}
                                    {aiResult !== null && (
                                        <div className="mt-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                                            <div>
                                                <p className="font-black text-emerald-700 dark:text-emerald-400 text-lg">{aiResult} kcal burned!</p>
                                                <p className="text-emerald-600 text-xs font-medium">Added to today's workout total ✓</p>
                                            </div>
                                        </div>
                                    )}

                                    {aiError && (
                                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-800 flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                            {aiError}
                                        </div>
                                    )}

                                    <button onClick={handleTrackActivity} disabled={isAiLoading}
                                        className="w-full mt-5 bg-gradient-to-r from-rose-600 to-orange-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-500/30 hover:from-rose-500 hover:to-orange-400 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                                        {isAiLoading ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Calculating...</>
                                        ) : aiResult !== null ? (
                                            <><CheckCircle2 className="w-5 h-5" /> Log Another Set</>
                                        ) : (
                                            <><Flame className="w-5 h-5" /> Calculate & Save Burn</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
