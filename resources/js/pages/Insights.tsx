import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, ArrowRight, BarChart3, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PageProps {
    auth: { user: any };
    targetDate: string;
    mealsOnDate: any[];
    aggregates: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
    weeklyTrends: {
        date: string;
        short_day: string;
        day_num: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    }[];
}

const TABS = ['All Meals', 'Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];

export default function Insights() {
    const { auth, targetDate, mealsOnDate, aggregates, weeklyTrends } = usePage().props as unknown as PageProps;
    const user = auth.user;

    const [activeTab, setActiveTab] = useState('All Meals');
    const [trendType, setTrendType] = useState('Calories');

    // Dynamic targets from User Model
    const dailyGoal = user.daily_calorie_target || 2000;
    const targets = {
        protein: user.daily_protein_target || 150,
        carbs: user.daily_carbs_target || 200,
        fats: user.daily_fats_target || 65,
    };

    // Calculate Percentages Dynamically Based on activeTab
    const filteredMeals = activeTab === 'All Meals' 
        ? mealsOnDate 
        : mealsOnDate.filter(m => m.meal_type === activeTab);
    
    // We replace the backend 'aggregates' with the dynamically filtered values!
    const dynamicAggregates = {
        calories: filteredMeals.reduce((acc, meal) => acc + meal.calories, 0),
        protein: filteredMeals.reduce((acc, meal) => acc + meal.protein, 0),
        carbs: filteredMeals.reduce((acc, meal) => acc + meal.carbs, 0),
        fats: filteredMeals.reduce((acc, meal) => acc + meal.fats, 0),
    };

    // Calculate budget percentage depending on if it's a specific meal category or all meals
    // We assume meals are ~28% of budget, snacks are ~8%
    const currentTabGoal = activeTab === 'All Meals' 
        ? dailyGoal 
        : (activeTab.includes('Snack') ? dailyGoal * 0.08 : dailyGoal * 0.28);
        
    const calPercent = Math.min(100, Math.round((dynamicAggregates.calories / currentTabGoal) * 100));
    
    // Animated Face Logic based on completion
    const getFaceState = () => {
        if (calPercent === 0) return { expression: '(-_-)', bg: 'bg-slate-200 text-slate-600', label: 'You haven\'t tracked any meal yet.' };
        if (calPercent < 60) return { expression: '(^-^)', bg: 'bg-emerald-100 text-emerald-600', label: 'Good start. Keep it up!' };
        if (calPercent <= 100) return { expression: '(^O^)', bg: 'bg-emerald-500 text-white', label: 'Perfect pace!' };
        return { expression: '(>_<)', bg: 'bg-red-500 text-white', label: 'You went over budget.' };
    };
    const faceState = getFaceState();

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get('/insights', { date: e.target.value }, { preserveState: true });
    };

    // Format header date (e.g., "30 Jan")
    const d = new Date(targetDate);
    const headerTitle = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} Insights`;

    // Calculate averages for charts
    const weeklyTotal = weeklyTrends.reduce((acc, day) => acc + day.calories, 0);
    const avgPerDay = Math.round(weeklyTotal / 7);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <Head title="Insights" />
            
            {/* Native Mobile Header with Hidden Calendar Hook */}
            <div className="bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center justify-between p-4 px-5">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-white" />
                    </Link>

                    <div className="flex-1 text-center relative group flex items-center justify-center">
                        <h1 className="text-xl font-medium text-slate-800 dark:text-white flex items-center gap-1 cursor-pointer">
                            {headerTitle} <ChevronDown className="w-5 h-5 opacity-50" />
                        </h1>
                        <input 
                            type="date" 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                            value={targetDate}
                            onChange={handleDateChange}
                        />
                    </div>
                    
                    <div className="w-10 line-clamp-1 block"></div>
                </div>

                {/* Sliding Tabs */}
                <div className="flex overflow-x-auto scrollbar-hide pt-2 pb-1 border-b border-slate-200 dark:border-slate-800 px-2">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap px-4 py-3 font-medium text-[15px] transition-all relative ${
                                activeTab === tab 
                                    ? 'text-red-500' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 rounded-t-full"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-lg mx-auto w-full p-4 space-y-6 mt-2">
                
                {/* Empty Tracker Card */}
                {dynamicAggregates.calories === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{faceState.label}</h2>
                        <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                            Track to get insights on nutrients, good/bad foods, and get healthy food suggestions
                        </p>
                        <hr className="border-slate-100 dark:border-slate-800 pb-4" />
                        <Link href="/dashboard" className="flex items-center justify-between text-red-500 font-bold hover:text-red-600 transition">
                            Track Your Meals <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}

                {/* Food Log Analysis Heading */}
                <div className="px-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <Activity className="w-5 h-5" />
                        <h3 className="font-semibold text-[17px] tracking-tight">Food Log Analysis</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                        See your daily calorie intake and calorie budget here. Start tracking to see this section come to life.
                    </p>
                </div>

                {/* Budget Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-[17px] font-bold text-slate-800 dark:text-white mb-6">Your Calorie Budget</h2>
                    
                    <div className="flex items-center gap-6 mb-8 mt-2 pl-2">
                        {/* Animated scalable Face Icon */}
                        <div className={`w-[80px] h-[80px] rounded-full flex items-center justify-center font-bold text-2xl transition-all shadow-inner ${faceState.bg}`}>
                            {faceState.expression}
                        </div>
                        
                        <div className="flex-1 pt-4 relative">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-slate-600 dark:text-slate-400 font-medium text-sm ml-[15%]">
                                    {dynamicAggregates.calories} / {Math.round(currentTabGoal)} Cal
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full relative overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-slate-900 dark:bg-slate-100 transition-all duration-700" style={{ width: `${calPercent}%` }}></div>
                            </div>
                        </div>
                        
                        <div className="text-5xl font-light text-slate-400 -mt-2">
                            {calPercent}<span className="text-2xl">%</span>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 font-medium mb-6">
                        People who track their meals are more likely to lose weight. Track to see your progress.
                    </p>

                    <h4 className="text-slate-500 font-medium text-sm mb-4">Macronutrients Breakup</h4>

                    <div className="space-y-4">
                        {[
                            { name: 'Proteins', icon: '🥜', value: dynamicAggregates.protein, target: Math.round(activeTab === 'All Meals' ? targets.protein : targets.protein * (activeTab.includes('Snack') ? 0.1 : 0.3)), w: Math.min(100, (dynamicAggregates.protein/Math.max(1, Math.round(activeTab === 'All Meals' ? targets.protein : targets.protein * (activeTab.includes('Snack') ? 0.1 : 0.3))))*100) },
                            { name: 'Fats', icon: '🥑', value: dynamicAggregates.fats, target: Math.round(activeTab === 'All Meals' ? targets.fats : targets.fats * (activeTab.includes('Snack') ? 0.1 : 0.3)), w: Math.min(100, (dynamicAggregates.fats/Math.max(1, Math.round(activeTab === 'All Meals' ? targets.fats : targets.fats * (activeTab.includes('Snack') ? 0.1 : 0.3))))*100) },
                            { name: 'Carbs', icon: '🥐', value: dynamicAggregates.carbs, target: Math.round(activeTab === 'All Meals' ? targets.carbs : targets.carbs * (activeTab.includes('Snack') ? 0.1 : 0.3)), w: Math.min(100, (dynamicAggregates.carbs/Math.max(1, Math.round(activeTab === 'All Meals' ? targets.carbs : targets.carbs * (activeTab.includes('Snack') ? 0.1 : 0.3))))*100) },
                        ].map(macro => (
                            <div key={macro.name} className="flex flex-wrap items-center justify-between text-sm py-1 gap-2">
                                <div className="flex items-center w-[25%] font-medium text-slate-700 dark:text-slate-300">
                                    <span className="mr-3 opacity-60 text-lg">{macro.icon}</span> {macro.name}
                                </div>
                                <div className="text-slate-500 font-medium opacity-80 min-w-[30%]">
                                    {macro.value} g / {macro.target} g
                                </div>
                                <div className="flex-1 flex items-center justify-end gap-3 min-w-[20%]">
                                    <div className="w-16 h-1 bg-slate-100 rounded-full relative overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full bg-slate-800 transition-all duration-700" style={{ width: `${macro.w}%` }}></div>
                                    </div>
                                    <span className="w-8 text-right text-slate-400 font-medium">{Math.round(macro.w)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <hr className="border-slate-100 dark:border-slate-800 my-4" />
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer">
                        View Top Contributors <ArrowRight className="w-4 h-4 opacity-50" />
                    </div>
                </div>

                {/* Weekly Trends Heading */}
                <div className="px-2 mt-8">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <BarChart3 className="w-5 h-5" />
                        <h3 className="font-semibold text-[17px] tracking-tight">Weekly Trends</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">
                        See your weekly calorie and macro (protein, fat, carbs) intake here. For an accurate analysis, track your breakfast, lunch, dinner and snacks every day.
                    </p>
                </div>

                {/* Weekly Trends Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[17px] font-bold text-slate-800 dark:text-white">Last 7 days</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-medium">Choose Calories or Macro:</span>
                            <select 
                                value={trendType}
                                onChange={(e) => setTrendType(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-full py-1 text-sm font-semibold text-slate-700 focus:ring-0 outline-none pl-3 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em_1em]"
                            >
                                <option>Calories</option>
                                <option>Protein</option>
                                <option>Carbs</option>
                                <option>Fats</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-10 mb-8 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                            <div className="text-2xl font-light text-slate-800 dark:text-white">
                                {weeklyTotal} <span className="text-lg">Cal</span>
                            </div>
                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Weekly Total</div>
                        </div>
                        <div>
                            <div className="text-2xl font-light text-slate-800 dark:text-white">
                                {avgPerDay} <span className="text-lg">Cal</span>
                            </div>
                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Average Per Day</div>
                        </div>
                    </div>

                    <div className="h-[250px] w-[calc(100%+30px)] -ml-5">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <ReferenceLine y={dailyGoal} stroke="#f87171" strokeDasharray="3 3" />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="short_day" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                    tickFormatter={(val, idx) => {
                                        const dayInfo = weeklyTrends[idx] ? `\\n${weeklyTrends[idx].day_num}` : '';
                                        return `${val}${dayInfo}`;
                                    }}
                                />
                                <YAxis 
                                    orientation="right" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                                    domain={[0, Math.max(2400, dailyGoal + 400)]}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey={trendType.toLowerCase()} 
                                    stroke="#334155" 
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: '#334155' }}
                                    activeDot={{ r: 5, fill: '#f97316' }}
                                    isAnimationActive={true}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Upsell Setup Hook */}
                {dynamicAggregates.calories === 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mt-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Don't miss out!</h2>
                        <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                            Track to get insights on nutrients, good/bad foods, and get healthy food suggestions
                        </p>
                        <hr className="border-slate-100 dark:border-slate-800 pb-4" />
                        <Link href="/dashboard" className="flex items-center justify-between text-red-500 font-bold hover:text-red-600 transition">
                            Track Your Meals <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
