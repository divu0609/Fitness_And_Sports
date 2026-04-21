import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Flame, Target, Activity, Utensils, Droplet, Apple, CheckCircle2, ChevronRight, Settings, Plus, Camera, Loader2, BookOpen, Bot, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import * as Dialog from '@radix-ui/react-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

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
    { title: 'Breakfast', icon: '🍞', hint: 'Start strong with a healthy breakfast' },
    { title: 'Morning Snack', icon: '🥜', hint: 'Keep your energy high with a light snack' },
    { title: 'Lunch', icon: '🥗', hint: 'Fuel up for the rest of your day' },
    { title: 'Evening Snack', icon: '🍐', hint: 'Refuel your body before dinner' },
    { title: 'Dinner', icon: '🍽️', hint: 'A healthy dinner aids great recovery' },
];

export default function Dashboard() {
    const user = usePage().props.auth.user as any;
    
    // Core State
    const [meals, setMeals] = useState<Meal[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    // Meal Modal State
    const [foodText, setFoodText] = useState('');
    const [activeMealType, setActiveMealType] = useState('Breakfast');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Onboarding Modal State
    const needsOnboarding = !user.daily_calorie_target;
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(needsOnboarding);
    const [onboardForm, setOnboardForm] = useState({
        age: 26,
        gender: 'male',
        height_cm: 175,
        weight_kg: 78,
        target_weight_kg: 70,
        target_months: 3
    });

    const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);

    // Dynamic Goals
    // Fallbacks if not set, but the onboarding should prevent this.
    const dailyGoal = user.daily_calorie_target || 2000;
    const proteinTarget = user.daily_protein_target || 150;
    const carbsTarget = user.daily_carbs_target || 200;
    const fatsTarget = user.daily_fats_target || 65;
    
    // Live Totals
    const consumedCalories = meals.reduce((acc, meal) => acc + meal.calories, 0);
    const percentIntake = Math.min(100, Math.round((consumedCalories / dailyGoal) * 100));

    // Calculate Category Targets Automatically (30% Meals, 10% Snacks)
    const mealBudget = Math.round(dailyGoal * 0.28);
    const snackBudget = Math.round(dailyGoal * 0.08);
    
    const getTargetForCategory = (title: string) => title.includes('Snack') ? snackBudget : mealBudget;

    // Helper to get local date string YYYY-MM-DD reliably avoiding UTC offsets
    const getClientDate = () => {
        const local = new Date();
        const offset = local.getTimezoneOffset() * 60000;
        return new Date(local.getTime() - offset).toISOString().split('T')[0];
    };

    // Fetch todays meals on mount
    useEffect(() => {
        axios.get(`/api/meals?client_date=${getClientDate()}`).then(res => {
            if (res.data && res.data.meals) {
                setMeals(res.data.meals);
            }
        }).catch(err => console.error("Could not fetch meals: ", err));
    }, []);

    const handleLogMeal = async () => {
        if (!foodText.trim()) return;
        setIsAiLoading(true);
        setErrorMsg('');

        try {
            const response = await axios.post('/api/meals/analyze', {
                food_description: foodText,
                meal_type: activeMealType,
                client_date: getClientDate()
            });

            if (response.data.success) {
                setMeals(prev => [...prev, response.data.meal]);
                setFoodText('');
                setIsModalOpen(false);
            }
        } catch (error: any) {
            // Show detailed Gemini response debugging if available
            const errorData = error.response?.data;
            const details = errorData?.details ? ` (Details: ${errorData.details})` : '';
            setErrorMsg((errorData?.error || 'Could not analyze meal.') + details);
            console.error("AI Error:", errorData);
        } finally {
            setIsAiLoading(false);
        }
    };

    const [onboardError, setOnboardError] = useState('');

    const handleOnboardingSubmit = async () => {
        setIsOnboardingLoading(true);
        setOnboardError('');
        try {
            const response = await axios.post('/api/profile/calculate-targets', onboardForm);
            if (response.data.success) {
                router.reload({ only: ['auth'] });
                setIsOnboardingOpen(false);
            }
        } catch (error: any) {
            const errorData = error.response?.data;
            const details = errorData?.details ? ` (Details: ${errorData.details})` : '';
            setOnboardError((errorData?.message || errorData?.error || 'Validation failed or AI crashed.') + details);
            console.error(errorData);
        } finally {
            setIsOnboardingLoading(false);
        }
    };

    const getCaloriesForType = (type: string) => {
        return meals.filter(m => m.meal_type === type).reduce((acc, meal) => acc + meal.calories, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 max-w-lg mx-auto w-full pb-24">
                
                {/* Header Context */}
                <div className="flex items-center justify-between mt-2">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        Today <ChevronRight className="w-5 h-5 text-slate-400 rotate-90" />
                    </h1>
                    <div className="flex items-center gap-4 text-slate-600">
                        <Settings className="w-5 h-5 cursor-pointer" onClick={() => setIsOnboardingOpen(true)} />
                        <div className="w-1 h-5 flex flex-col justify-between cursor-pointer">
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        </div>
                    </div>
                </div>

                {/* Calorie Target Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex justify-center items-center gap-4">
                         <div className="w-12 h-12 rounded-full border border-orange-100 flex items-center justify-center relative overlow-hidden">
                            <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#f97316 ${percentIntake}%, transparent ${percentIntake}% 100%)` }}></div>
                            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center relative z-10">
                                <Utensils className="w-5 h-5 text-orange-500" />
                            </div>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-slate-800 dark:text-white font-bold text-lg">{consumedCalories} / {dailyGoal} Cal</span>
                            <span className="text-xs text-orange-600 font-medium">{dailyGoal - consumedCalories} Cal Remaining</span>
                         </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 cursor-pointer" onClick={() => setIsOnboardingOpen(true)}>
                        <Activity className="w-5 h-5" />
                    </div>
                </div>

                {/* Sub Menu Pucks */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                    <button className="flex items-center gap-2 whitespace-nowrap bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 font-medium text-sm hover:border-slate-300 transition">
                        <div className="bg-slate-900 text-white p-1 rounded-md"><BookOpen className="w-4 h-4"/></div> Diet Plan
                    </button>
                    <Link href="/history" className="flex items-center gap-2 whitespace-nowrap bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 font-medium text-sm hover:border-indigo-300 transition ring-1 ring-indigo-50/50">
                        <div className="bg-indigo-600 text-white p-1 rounded-md shadow shadow-indigo-500/20"><Calendar className="w-4 h-4"/></div> History Map
                    </Link>
                    <Link href="/insights" className="flex items-center gap-2 whitespace-nowrap bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 font-medium text-sm hover:border-slate-300 transition">
                        <div className="bg-slate-900 text-white p-1 rounded-md"><Activity className="w-4 h-4"/></div> Insights
                    </Link>
                    <button className="flex items-center gap-2 whitespace-nowrap bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 font-medium text-sm hover:border-slate-300">
                        <div className="bg-slate-900 text-white p-1 rounded-md"><CheckCircle2 className="w-4 h-4"/></div> Recipes
                    </button>
                </div>

                {/* MEAL LISTINGS */}
                <div className="space-y-10 mt-4">
                    {mealCategories.map((cat, idx) => {
                        const currentCals = getCaloriesForType(cat.title);
                        const hasMeals = currentCals > 0;
                        const target = getTargetForCategory(cat.title);

                        return (
                            <div key={idx}>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">{cat.title}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-slate-500 font-medium">{currentCals} of {target} Cal</span>
                                        <button 
                                            onClick={() => { setActiveMealType(cat.title); setIsModalOpen(true); }}
                                            className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition shadow-md shadow-orange-500/30">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                
                                {hasMeals ? (
                                    <div className="space-y-3">
                                        {meals.filter(m => m.meal_type === cat.title).map(meal => (
                                            <div key={meal.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl flex items-center justify-between border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <div className="font-semibold text-slate-800 dark:text-white leading-tight mb-1">{meal.food_description}</div>
                                                    <div className="text-xs text-slate-500 flex gap-3">
                                                        <span>P: {meal.protein}g</span>
                                                        <span>C: {meal.carbs}g</span>
                                                        <span>F: {meal.fats}g</span>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm">
                                                    {meal.calories} kcal
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-xs text-slate-400 mb-3 ml-1">{cat.hint} {cat.icon}</div>
                                        {idx === 0 && (
                                            <div onClick={() => setIsOnboardingOpen(true)} className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer group hover:border-slate-300">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow shadow-slate-900/20">
                                                        <Activity className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-semibold text-slate-800 dark:text-white">Adjust Daily AI Goals</span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition" />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Floating Snap Button */}
                <div className="fixed bottom-6 right-6 z-40 lg:right-[calc(50%-240px)]">
                    <button className="bg-slate-900 text-white px-6 py-4 rounded-full font-bold shadow-xl shadow-slate-900/30 flex items-center gap-2 hover:bg-slate-800 hover:scale-105 transition-all">
                        <Camera className="w-5 h-5" /> Snap
                    </button>
                </div>


                {/* AI Meal Logging Modal */}
                <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-[90%] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-xl rounded-3xl dark:bg-slate-950 px-6 py-8">
                            
                            <Dialog.Title className="text-2xl font-bold text-slate-900 mb-2">Track {activeMealType}</Dialog.Title>
                            <Dialog.Description className="text-slate-500 mb-6 font-medium">
                                Type what you ate naturally. Our AI will automatically calculate its nutritional values and macros.
                            </Dialog.Description>

                            {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-semibold">{errorMsg}</div>}

                            <div className="relative">
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-700 resize-none"
                                    placeholder="e.g., I had a 200g grilled chicken breast and a large bowl of white rice, plus an apple."
                                    value={foodText}
                                    onChange={e => setFoodText(e.target.value)}
                                    disabled={isAiLoading}
                                ></textarea>
                                
                                {isAiLoading && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                                            <span className="text-emerald-700 font-bold text-sm tracking-widest animate-pulse">AI ANALYZING...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <Dialog.Close asChild>
                                    <button disabled={isAiLoading} className="px-5 py-3 rounded-full font-bold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                                </Dialog.Close>
                                <button 
                                    onClick={handleLogMeal}
                                    disabled={isAiLoading || !foodText.trim()}
                                    className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-500/30 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    Log Meal
                                </button>
                            </div>
                            
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Initial AI Goal Onboarding Modal */}
                <Dialog.Root open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" />
                        <Dialog.Content className="fixed left-[50%] top-[50%] z-[100] w-[95%] max-w-md translate-x-[-50%] translate-y-[-50%] border-none bg-white shadow-2xl rounded-3xl dark:bg-slate-900 overflow-hidden">
                            
                            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 text-white relative overflow-hidden">
                                <Bot className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10" />
                                <h2 className="text-2xl font-bold mb-2">Personalize Your AI</h2>
                                <p className="text-indigo-100 text-sm">Let our AI build your exact nutritional requirements based on your unique body metrics.</p>
                            </div>

                            <div className="p-6 pb-8">
                                {onboardError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-semibold">{onboardError}</div>}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Age</label>
                                            <input type="number" value={onboardForm.age} onChange={e => setOnboardForm({...onboardForm, age: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
                                            <select value={onboardForm.gender} onChange={e => setOnboardForm({...onboardForm, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Height (cm)</label>
                                            <input type="number" value={onboardForm.height_cm} onChange={e => setOnboardForm({...onboardForm, height_cm: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Weight (kg)</label>
                                            <input type="number" value={onboardForm.weight_kg} onChange={e => setOnboardForm({...onboardForm, weight_kg: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Weight (kg)</label>
                                            <input type="number" value={onboardForm.target_weight_kg} onChange={e => setOnboardForm({...onboardForm, target_weight_kg: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 mt-2">Timeline (Months)</label>
                                        <input type="number" min="1" max="60" value={onboardForm.target_months} onChange={e => setOnboardForm({...onboardForm, target_months: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleOnboardingSubmit}
                                    disabled={isOnboardingLoading}
                                    className="w-full mt-8 bg-indigo-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isOnboardingLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Calculating Goals...</>
                                    ) : (
                                        'Set Personalized Goals'
                                    )}
                                </button>
                                
                                {needsOnboarding && !isOnboardingLoading && (
                                     <p className="text-center text-xs text-slate-400 mt-4 font-medium px-4">
                                        You must complete this setup to let the AI calculate your perfect daily targets.
                                     </p>
                                )}
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

            </div>
        </AppLayout>
    );
}
