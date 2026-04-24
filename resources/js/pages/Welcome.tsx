import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import axios from "axios";
import { Activity, Apple, MessageCircle, BarChart2, Smartphone, CheckCircle, ChevronRight, Menu, X, Loader2, ShieldCheck, Dumbbell } from "lucide-react";

interface BmiResult {
    bmi: number;
    category: string;
    body_fat_estimate: string;
    ideal_weight_range: string;
    health_risk: string;
    summary: string;
    tip: string;
}

export default function Welcome() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    // BMI Calculator State
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState<"male" | "female">("male");
    const [bmiResult, setBmiResult] = useState<BmiResult | null>(null);
    const [bmiLoading, setBmiLoading] = useState(false);
    const [bmiError, setBmiError] = useState("");

    const categoryColor = (cat: string) => {
        if (cat === "Underweight") return { bar: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
        if (cat === "Normal") return { bar: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
        if (cat === "Overweight") return { bar: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
        return { bar: "bg-red-500", text: "text-red-600", bg: "bg-red-50 border-red-200" };
    };

    const riskColor = (risk: string) => {
        if (risk === "Low") return "text-emerald-600 bg-emerald-100";
        if (risk === "Moderate") return "text-amber-600 bg-amber-100";
        if (risk === "High") return "text-orange-600 bg-orange-100";
        return "text-red-600 bg-red-100";
    };

    // BMI scale: 15 → 40 mapped to 0–100%
    const bmiToPercent = (b: number) => Math.min(100, Math.max(0, ((b - 15) / 25) * 100));

    const calculateBMI = async () => {
        if (!height || !weight || !age) {
            setBmiError("Please fill in all fields.");
            return;
        }
        setBmiLoading(true);
        setBmiError("");
        setBmiResult(null);
        try {
            const response = await axios.post("/api/bmi/analyze", {
                height_cm: parseFloat(height),
                weight_kg: parseFloat(weight),
                age: parseInt(age),
                gender,
            });
            if (response.data.success) {
                setBmiResult(response.data.data);
            }
        } catch (err: any) {
            setBmiError(err.response?.data?.error || "Analysis failed. Please try again.");
        } finally {
            setBmiLoading(false);
        }
    };
    return (
        <div className="bg-white text-slate-900 font-sans min-h-screen selection:bg-emerald-200">
            {/* TOP BANNER */}
            <div className="bg-emerald-900 text-white text-center py-2 px-4 shadow-sm flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
                Clinically backed GLP-1 medication, doctor support, and personalized coaching — all in one plan.
                <button className="underline font-bold hover:text-emerald-300 transition shrink-0">Learn More</button>
            </div>

            {/* HEADER */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-8 h-8 text-emerald-600" />
                        <span className="text-2xl font-black tracking-tight text-slate-900">Fit<span className="text-emerald-600">Core</span></span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
                        <a href="#features" className="hover:text-emerald-600 transition">Features</a>
                        <a href="#company" className="hover:text-emerald-600 transition">Company</a>
                        <a href="/community" className="hover:text-emerald-600 transition text-emerald-600">Community</a>
                        <a href="#support" className="hover:text-emerald-600 transition">Support</a>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-slate-900 font-semibold hover:text-emerald-600 transition">
                            Log in
                        </Link>
                        <Link href="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-emerald-600 transition shadow-lg hover:shadow-emerald-500/30">
                            Register
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-100 p-4 flex flex-col gap-4 shadow-lg absolute w-full left-0 z-50">
                        <a href="#features" className="font-semibold text-slate-600 hover:text-emerald-600">Features</a>
                        <a href="#company" className="font-semibold text-slate-600 hover:text-emerald-600">Company</a>
                        <a href="/community" className="font-semibold text-emerald-600">Community 🌟</a>
                        <Link href="/login" className="font-semibold text-slate-600 hover:text-emerald-600">Log in</Link>
                        <Link href="/register" className="bg-slate-900 text-center text-white px-5 py-3 rounded-xl font-semibold mt-2">
                            Register
                        </Link>
                    </div>
                )}
            </header>

            <main>
                {/* HERO SECTION */}
                <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 bg-gradient-to-b from-emerald-50/50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                            <div className="max-w-2xl text-center lg:text-left z-10">
                                <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-emerald-700 bg-emerald-100 mb-6">
                                    <span className="flex w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                    Meet FitCore. Smart health made easy.
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                                    Health Made <br className="hidden lg:block" /> Easy <span className="text-emerald-600 italic">Smarter.</span>
                                </h1>
                                <p className="mt-4 text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0">
                                    Improve your nutrition with FitCore Snap's advanced meal tracking & meet Ria, your personalized health coach. Accelerate your fitness goals to a whole new level.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link href="/register" className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2">
                                        Try FitCore Snap <ChevronRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="/register" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm">
                                        Talk to Ria Coach
                                    </Link>
                                </div>
                                {/* AI-Powered BMI Calculator */}
                                <div className="mt-10 w-full max-w-sm mx-auto lg:mx-0 bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
                                    {/* Card Header */}
                                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-white/80" />
                                            <span className="text-white font-bold tracking-tight">BMI Analyzer</span>
                                        </div>
                                        <p className="text-emerald-100 text-xs mt-1">Powered by Gemma · Gender-aware analysis</p>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        {/* Gender Toggle */}
                                        <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-1 gap-1">
                                            <button
                                                id="gender-male"
                                                onClick={() => setGender("male")}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === "male" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                ♂ Male
                                            </button>
                                            <button
                                                id="gender-female"
                                                onClick={() => setGender("female")}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${gender === "female" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                ♀ Female
                                            </button>
                                        </div>

                                        {/* Inputs Row */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Height</label>
                                                <input
                                                    id="bmi-height"
                                                    type="number"
                                                    placeholder="cm"
                                                    value={height}
                                                    onChange={(e) => setHeight(e.target.value)}
                                                    className="border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition w-full"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight</label>
                                                <input
                                                    id="bmi-weight"
                                                    type="number"
                                                    placeholder="kg"
                                                    value={weight}
                                                    onChange={(e) => setWeight(e.target.value)}
                                                    className="border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition w-full"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age</label>
                                                <input
                                                    id="bmi-age"
                                                    type="number"
                                                    placeholder="yrs"
                                                    value={age}
                                                    onChange={(e) => setAge(e.target.value)}
                                                    className="border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition w-full"
                                                />
                                            </div>
                                        </div>

                                        {bmiError && (
                                            <p className="text-red-500 text-xs font-semibold px-1">{bmiError}</p>
                                        )}

                                        <button
                                            id="bmi-calculate-btn"
                                            onClick={calculateBMI}
                                            disabled={bmiLoading}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {bmiLoading ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                                            ) : (
                                                "Analyze Now"
                                            )}
                                        </button>

                                        {/* Result Card */}
                                        {bmiResult && (() => {
                                            const colors = categoryColor(bmiResult.category);
                                            const pct = bmiToPercent(Number(bmiResult.bmi));
                                            return (
                                                <div className={`rounded-2xl border p-4 space-y-3 ${colors.bg}`}>
                                                    {/* BMI Score + Category */}
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className={`text-3xl font-black tracking-tighter ${colors.text}`}>
                                                                {bmiResult.bmi}
                                                            </div>
                                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">BMI Score</div>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.text} bg-white/60 border ${colors.bg}`}>
                                                            {bmiResult.category}
                                                        </span>
                                                    </div>

                                                    {/* BMI Scale Bar */}
                                                    <div className="relative w-full h-2 bg-white/60 rounded-full overflow-hidden">
                                                        <div className="absolute inset-0 flex">
                                                            <div className="h-full bg-blue-400" style={{ width: "24%" }} />
                                                            <div className="h-full bg-emerald-400" style={{ width: "26%" }} />
                                                            <div className="h-full bg-amber-400" style={{ width: "20%" }} />
                                                            <div className="flex-1 h-full bg-red-400" />
                                                        </div>
                                                        <div
                                                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-700 shadow transition-all duration-700"
                                                            style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-[9px] font-bold text-slate-400">
                                                        <span>Underweight</span><span>Normal</span><span>Over</span><span>Obese</span>
                                                    </div>

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                                        <div className="bg-white/60 rounded-xl p-2.5">
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Body Fat Est.</div>
                                                            <div className="font-bold text-slate-800 text-sm">{bmiResult.body_fat_estimate}</div>
                                                        </div>
                                                        <div className="bg-white/60 rounded-xl p-2.5">
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Ideal Weight</div>
                                                            <div className="font-bold text-slate-800 text-sm">{bmiResult.ideal_weight_range}</div>
                                                        </div>
                                                        <div className="bg-white/60 rounded-xl p-2.5 col-span-2">
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Health Risk</div>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskColor(bmiResult.health_risk)}`}>
                                                                {bmiResult.health_risk}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Health Summary */}
                                                    <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1 border-t border-white/50">
                                                        {bmiResult.summary}
                                                    </p>

                                                    {/* Tip */}
                                                    <div className="flex gap-2 bg-white/60 rounded-xl p-2.5">
                                                        <Dumbbell className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                        <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{bmiResult.tip}</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-slate-500 font-medium">
                                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> No crash diets</div>
                                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> 100% personalized</div>
                                </div>
                            </div>

                            {/* Hero Mockup Wrapper (Device Frame Simulation) */}
                            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px] lg:max-w-[380px] perspective-1000">
                                {/* Decorative elements behind device */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-emerald-200/40 to-blue-200/40 blur-3xl rounded-full -z-10"></div>

                                <div className="relative rounded-[3rem] bg-slate-900 p-3 shadow-2xl ring-1 ring-slate-900/5 transform transition hover:scale-[1.02] duration-700 ease-out">
                                    {/* Notch */}
                                    <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20 top-3">
                                        <div className="w-32 h-6 bg-black rounded-b-3xl"></div>
                                    </div>
                                    <div className="overflow-hidden rounded-[2.5rem] bg-white aspect-[9/19.5]">
                                        <img src="/images/hero_app_mockup_1776710124800.png" alt="FitCore App Dashboard" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURE 1: SNAP */}
                <section id="features" className="py-24 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">

                            {/* Device Frame */}
                            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px] order-2 lg:order-1">
                                <div className="absolute -inset-4 bg-emerald-100/50 rounded-full blur-2xl -z-10"></div>
                                <div className="relative rounded-[3rem] bg-slate-900 p-3 shadow-2xl transform -rotate-2">
                                    <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20 top-3">
                                        <div className="w-32 h-6 bg-black rounded-b-3xl"></div>
                                    </div>
                                    <div className="overflow-hidden rounded-[2.5rem] bg-white aspect-[9/19]">
                                        <img src="/images/food_snap_mockup_1776710142023.png" alt="Snap a photo of your meal" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>

                            <div className="order-1 lg:order-2 text-center lg:text-left">
                                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                                    Track Your Food <span className="text-emerald-600">Calories</span>
                                </h2>
                                <p className="text-xl text-slate-600 mb-8">
                                    Get the nutritional details of your meal and smart, data-driven advice.
                                </p>

                                <div className="space-y-6 mb-10 text-left">
                                    {/* <div className="flex bg-slate-50 p-4 rounded-2xl border border-slate-100"> */}
                                    {/* <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                                            <Smartphone className="w-6 h-6" />
                                        </div> */}
                                    {/* <div>
                                            <h4 className="text-lg font-bold text-slate-900">Snap a photo of your meal.</h4>
                                            <p className="text-slate-500 mt-1">Let the AI do the heavy lifting of measuring portions.</p>
                                        </div> */}
                                    {/* </div> */}
                                    <div className="flex bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                                            <Apple className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">Identifies foods instantly.</h4>
                                            <p className="text-slate-500 mt-1">Snap tracks your carbs, protein, and fat automatically.</p>
                                        </div>
                                    </div>
                                    <div className="flex bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                                            <BarChart2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">Actionable smart insights.</h4>
                                            <p className="text-slate-500 mt-1">Ria gives you instant feedback to improve your diet.</p>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/register" className="inline-flex bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-600 transition shadow-lg items-center gap-2">
                                    Calculate Your Calories
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURE 2: COACH RIA */}
                <section className="py-24 bg-slate-50 border-y border-slate-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">

                            <div className="text-center lg:text-left">
                                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                                    Try Ria - Your Personal <br /><span className="text-emerald-600">Health Coach!</span>
                                </h2>
                                <p className="text-xl text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0">
                                    Harness the power of data-driven health. Ria anticipates your needs, offering insights and notifications to steer your choices. No crash diets, only balanced nutrition.
                                </p>

                                <ul className="space-y-4 mb-10 text-left w-max mx-auto lg:mx-0">
                                    <li className="flex items-center font-medium text-slate-700">
                                        <CheckCircle className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0" />
                                        Personalized Guidance On The Go
                                    </li>
                                    <li className="flex items-center font-medium text-slate-700">
                                        <CheckCircle className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0" />
                                        Customised diet and workout plans
                                    </li>
                                    <li className="flex items-center font-medium text-slate-700">
                                        <CheckCircle className="w-6 h-6 text-emerald-500 mr-3 flex-shrink-0" />
                                        Anytime, anywhere personal assistance
                                    </li>
                                </ul>

                                <Link href="/register" className="inline-flex bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30 items-center justify-center gap-2">
                                    <MessageCircle className="w-5 h-5" /> Talk to Ria Coach
                                </Link>
                            </div>

                            {/* Device Frame */}
                            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px]">
                                <div className="absolute -inset-4 bg-blue-100/50 rounded-full blur-2xl -z-10"></div>
                                <div className="relative rounded-[3rem] bg-slate-900 p-3 shadow-2xl transform rotate-2">
                                    <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20 top-3">
                                        <div className="w-32 h-6 bg-black rounded-b-3xl"></div>
                                    </div>
                                    <div className="overflow-hidden rounded-[2.5rem] bg-white aspect-[9/19]">
                                        <img src="/images/ai_coach_mockup_1776710159055.png" alt="Chat with AI Coach" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BANNER CTA */}
                <section className="py-24 bg-slate-900 text-center px-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-slate-900 to-slate-900"></div>
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                            Ready to transform your lifestyle?
                        </h2>
                        <p className="text-xl text-slate-300 mb-10">
                            Join millions who have successfully reached their goals using FitCore's expert-backed approach.
                        </p>
                        <Link href="/register" className="inline-block bg-emerald-600 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-emerald-500 transition shadow-xl shadow-emerald-900/50">
                            Select a Plan
                        </Link>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="w-6 h-6 text-emerald-600" />
                                <span className="text-xl font-black tracking-tight text-slate-900">Fit<span className="text-emerald-600">Core</span></span>
                            </div>
                            <p className="text-slate-500 text-sm mb-4">
                                Empowering people globally to live healthier and happier lives.
                            </p>
                            <a href="mailto:support@fitcore.app" className="font-semibold text-emerald-600 block mb-2">support@fitcore.app</a>
                            <a href="tel:18005550199" className="font-semibold text-emerald-600 block">1800-555-0199</a>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 tracking-wide text-sm uppercase">Company</h3>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-emerald-600 transition">About Us</a></li>
                                <li><a href="#" className="hover:text-emerald-600 transition">Careers</a></li>
                                <li><a href="#" className="hover:text-emerald-600 transition">Press</a></li>
                                <li><a href="#" className="hover:text-emerald-600 transition">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 tracking-wide text-sm uppercase">Features</h3>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-emerald-600 transition">FitCore Snap</a></li>
                                <li><a href="#" className="hover:text-emerald-600 transition">AI Coach Ria</a></li>
                                <li><a href="#" className="hover:text-emerald-600 transition">Meal Plans</a></li>
                                <li><a href="#" className="hover:text-emerald-600 transition">Workouts</a></li>
                            </ul>
                        </div>

                        {/* <div className="col-span-2 md:col-span-1">
                            <h3 className="font-bold text-slate-900 mb-4 tracking-wide text-sm uppercase">Download</h3>
                            <div className="space-y-3 flex flex-col sm:flex-row md:flex-col gap-3 sm:gap-4 md:gap-3 items-start">
                                <button className="w-full sm:w-auto md:w-full bg-slate-900 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-3 hover:bg-slate-800 transition m-0">
                                    <Apple className="w-6 h-6" />
                                    <div className="text-left leading-tight">
                                        <div className="text-[10px] text-slate-300">Download on the</div>
                                        <div className="font-semibold text-sm">App Store</div>
                                    </div>
                                </button>
                                <button className="w-full sm:w-auto md:w-full bg-slate-900 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-3 hover:bg-slate-800 transition m-0 mt-0">
                                    <Smartphone className="w-6 h-6" />
                                    <div className="text-left leading-tight">
                                        <div className="text-[10px] text-slate-300">GET IT ON</div>
                                        <div className="font-semibold text-sm">Google Play</div>
                                    </div>
                                </button>
                            </div>
                        </div> */}
                    </div>

                    <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                        <div>© 2026 FitCore Inc. All rights reserved.</div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
                            <a href="#" className="hover:text-slate-900">Terms of Service</a>
                            <a href="#" className="hover:text-slate-900">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}