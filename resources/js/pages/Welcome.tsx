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

const neoClasses = {
    bg: "bg-[#e0e5ec]",
    flat: "bg-[#e0e5ec] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]",
    flatHover: "hover:shadow-[12px_12px_20px_rgb(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] active:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] transition-all duration-300",
    flatSm: "bg-[#e0e5ec] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]",
    inset: "bg-[#e0e5ec] shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)]",
    text: "text-slate-700",
    textAccent: "text-emerald-600",
};

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
        if (cat === "Underweight") return { text: "text-blue-500", color: "text-blue-500" };
        if (cat === "Normal") return { text: "text-emerald-500", color: "text-emerald-500" };
        if (cat === "Overweight") return { text: "text-amber-500", color: "text-amber-500" };
        return { text: "text-red-500", color: "text-red-500" };
    };

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
        <div className={`${neoClasses.bg} text-slate-700 font-sans min-h-screen selection:bg-emerald-200`}>
            {/* TOP BANNER */}
            <div className={`${neoClasses.bg} ${neoClasses.flatSm} text-emerald-700 text-center py-3 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold z-50 relative border-b border-white/20`}>
                Clinically backed GLP-1 medication, doctor support, and personalized coaching — all in one plan.
                <button className="font-black hover:text-emerald-500 transition shrink-0 underline">Learn More</button>
            </div>

            {/* HEADER */}
            <header className={`${neoClasses.bg} sticky top-0 z-40 transition-all`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${neoClasses.flatSm}`}>
                            <Activity className={`w-6 h-6 ${neoClasses.textAccent}`} />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-800">Fit<span className={neoClasses.textAccent}>Core</span></span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 font-bold text-slate-500">
                        <a href="#features" className="hover:text-emerald-600 transition">Features</a>
                        <Link href="/shop" className="hover:text-emerald-600 transition">Sports Shop</Link>
                        <a href="/community" className="hover:text-emerald-600 transition">Community</a>
                        <a href="#support" className="hover:text-emerald-600 transition">Support</a>
                    </nav>

                    <div className="hidden md:flex items-center gap-5">
                        <Link href="/login" className={`px-6 py-3 rounded-xl font-bold text-slate-600 hover:text-emerald-600 transition ${neoClasses.flat} ${neoClasses.flatHover}`}>
                            Log in
                        </Link>
                        <Link href="/register" className={`px-6 py-3 rounded-xl font-bold text-emerald-600 transition ${neoClasses.flat} ${neoClasses.flatHover}`}>
                            Register
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className={`md:hidden p-3 rounded-xl text-slate-600 ${neoClasses.flat} ${neoClasses.flatHover}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileMenuOpen && (
                    <div className={`md:hidden ${neoClasses.bg} p-6 flex flex-col gap-5 absolute w-full left-0 z-50 shadow-2xl`}>
                        <a href="#features" className={`font-bold text-slate-600 p-4 rounded-xl ${neoClasses.flatSm} hover:text-emerald-600`}>Features</a>
                        <Link href="/shop" className={`font-bold text-slate-600 p-4 rounded-xl ${neoClasses.flatSm} hover:text-emerald-600`}>Sports Shop</Link>
                        <a href="/community" className={`font-bold text-slate-600 p-4 rounded-xl ${neoClasses.flatSm} hover:text-emerald-600`}>Community</a>
                        <a href="#support" className={`font-bold text-slate-600 p-4 rounded-xl ${neoClasses.flatSm} hover:text-emerald-600`}>Support</a>
                        <Link href="/login" className={`font-bold text-slate-600 p-4 rounded-xl ${neoClasses.flatSm} hover:text-emerald-600`}>Log in</Link>
                        <Link href="/register" className={`text-center text-emerald-600 p-4 rounded-xl font-bold mt-2 ${neoClasses.flat}`}>
                            Register
                        </Link>
                    </div>
                )}
            </header>

            <main>
                {/* HERO SECTION */}
                <section className={`relative overflow-hidden pt-12 pb-32 lg:pt-24 lg:pb-40 ${neoClasses.bg}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
                            <div className="max-w-2xl text-center lg:text-left z-10">
                                <div className={`inline-flex items-center rounded-full px-5 py-2 text-sm font-bold text-emerald-600 mb-8 ${neoClasses.inset}`}>
                                    <span className="flex w-2.5 h-2.5 rounded-full bg-emerald-500 mr-3 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                    Meet FitCore. Smart health made easy.
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-800 leading-[1.1] mb-8">
                                    Health Made <br className="hidden lg:block" /> Easy <span className="text-emerald-500 italic">Smarter.</span>
                                </h1>
                                <p className="mt-6 text-xl text-slate-600 mb-12 max-w-xl mx-auto lg:mx-0 font-medium">
                                    Improve your nutrition with FitCore Snap's advanced meal tracking & meet Ria, your personalized health coach. Accelerate your fitness goals to a whole new level.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                                    <Link href="/register" className={`px-8 py-5 rounded-2xl font-bold text-lg text-emerald-600 flex items-center justify-center gap-3 ${neoClasses.flat} ${neoClasses.flatHover}`}>
                                        Try FitCore Snap <ChevronRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="/register" className={`px-8 py-5 rounded-2xl font-bold text-lg text-slate-600 flex items-center justify-center gap-3 ${neoClasses.flat} ${neoClasses.flatHover}`}>
                                        Talk to Ria Coach
                                    </Link>
                                </div>

                                {/* AI-Powered BMI Calculator */}
                                <div className={`mt-20 w-full max-w-md mx-auto lg:mx-0 rounded-[2rem] p-8 ${neoClasses.flat}`}>
                                    {/* Card Header */}
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className={`p-4 rounded-2xl ${neoClasses.inset}`}>
                                            <ShieldCheck className="w-7 h-7 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-slate-800 font-black text-xl">BMI Analyzer</h3>
                                            <p className="text-slate-500 text-sm font-bold mt-1">Powered by Gemma · Gender-aware</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Gender Toggle */}
                                        <div className={`flex rounded-2xl p-2 gap-2 ${neoClasses.inset}`}>
                                            <button
                                                id="gender-male"
                                                onClick={() => setGender("male")}
                                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${gender === "male" ? neoClasses.flat + ' text-emerald-600' : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                ♂ Male
                                            </button>
                                            <button
                                                id="gender-female"
                                                onClick={() => setGender("female")}
                                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${gender === "female" ? neoClasses.flat + ' text-emerald-600' : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                ♀ Female
                                            </button>
                                        </div>

                                        {/* Inputs Row */}
                                        <div className="grid grid-cols-3 gap-5">
                                            <div className="flex flex-col gap-3">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Height</label>
                                                <input
                                                    id="bmi-height"
                                                    type="number"
                                                    placeholder="cm"
                                                    value={height}
                                                    onChange={(e) => setHeight(e.target.value)}
                                                    className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 focus:ring-emerald-400 bg-transparent border-none ${neoClasses.inset}`}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Weight</label>
                                                <input
                                                    id="bmi-weight"
                                                    type="number"
                                                    placeholder="kg"
                                                    value={weight}
                                                    onChange={(e) => setWeight(e.target.value)}
                                                    className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 focus:ring-emerald-400 bg-transparent border-none ${neoClasses.inset}`}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Age</label>
                                                <input
                                                    id="bmi-age"
                                                    type="number"
                                                    placeholder="yrs"
                                                    value={age}
                                                    onChange={(e) => setAge(e.target.value)}
                                                    className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 focus:ring-emerald-400 bg-transparent border-none ${neoClasses.inset}`}
                                                />
                                            </div>
                                        </div>

                                        {bmiError && (
                                            <p className="text-red-500 text-sm font-bold px-2">{bmiError}</p>
                                        )}

                                        <button
                                            id="bmi-calculate-btn"
                                            onClick={calculateBMI}
                                            disabled={bmiLoading}
                                            className={`w-full mt-2 text-emerald-600 font-black py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-60 text-lg ${neoClasses.flat} ${neoClasses.flatHover}`}
                                        >
                                            {bmiLoading ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                                            ) : (
                                                "Analyze Now"
                                            )}
                                        </button>

                                        {/* Result Card */}
                                        {bmiResult && (() => {
                                            const pct = bmiToPercent(Number(bmiResult.bmi));
                                            const catColors = categoryColor(bmiResult.category);
                                            return (
                                                <div className={`rounded-3xl p-6 mt-6 space-y-6 ${neoClasses.inset}`}>
                                                    {/* BMI Score + Category */}
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-4xl font-black tracking-tighter text-slate-800">
                                                                {bmiResult.bmi}
                                                            </div>
                                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">BMI Score</div>
                                                        </div>
                                                        <div className={`px-5 py-2 rounded-xl text-sm font-black ${catColors.text} ${neoClasses.flatSm}`}>
                                                            {bmiResult.category}
                                                        </div>
                                                    </div>

                                                    {/* BMI Scale Bar */}
                                                    <div className={`relative w-full h-4 rounded-full overflow-hidden ${neoClasses.inset}`}>
                                                        <div className="absolute inset-0 flex opacity-60">
                                                            <div className="h-full bg-blue-400" style={{ width: "24%" }} />
                                                            <div className="h-full bg-emerald-400" style={{ width: "26%" }} />
                                                            <div className="h-full bg-amber-400" style={{ width: "20%" }} />
                                                            <div className="flex-1 h-full bg-red-400" />
                                                        </div>
                                                        <div
                                                            className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-all duration-700 ${neoClasses.flatSm}`}
                                                            style={{ left: `${pct}%`, transform: "translate(-50%, -50%)" }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                                        <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                                                    </div>

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className={`rounded-2xl p-4 ${neoClasses.flatSm}`}>
                                                            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Body Fat Est.</div>
                                                            <div className="font-bold text-slate-700 text-lg">{bmiResult.body_fat_estimate}</div>
                                                        </div>
                                                        <div className={`rounded-2xl p-4 ${neoClasses.flatSm}`}>
                                                            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Ideal Weight</div>
                                                            <div className="font-bold text-slate-700 text-lg">{bmiResult.ideal_weight_range}</div>
                                                        </div>
                                                    </div>

                                                    {/* Health Summary */}
                                                    <p className="text-sm text-slate-600 font-bold leading-relaxed pt-2">
                                                        {bmiResult.summary}
                                                    </p>

                                                    {/* Tip */}
                                                    <div className={`flex gap-3 rounded-2xl p-4 ${neoClasses.flatSm}`}>
                                                        <Dumbbell className={`w-5 h-5 ${catColors.text} shrink-0`} />
                                                        <p className="text-xs text-slate-700 font-bold leading-relaxed">{bmiResult.tip}</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-600 font-bold">
                                    <div className="flex items-center gap-2"><div className={`p-1.5 rounded-full ${neoClasses.inset}`}><CheckCircle className="w-4 h-4 text-emerald-500" /></div> No crash diets</div>
                                    <div className="flex items-center gap-2"><div className={`p-1.5 rounded-full ${neoClasses.inset}`}><CheckCircle className="w-4 h-4 text-emerald-500" /></div> 100% personalized</div>
                                </div>
                            </div>

                            {/* Hero Mockup */}
                            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px] lg:max-w-[380px]">
                                <div className={`relative rounded-[3rem] p-5 ${neoClasses.flat}`}>
                                    <div className={`overflow-hidden rounded-[2.5rem] aspect-[9/19.5] ${neoClasses.inset} bg-white p-2`}>
                                        <img src="/images/hero_app_mockup_1776710124800.png" alt="FitCore App Dashboard" className="w-full h-full object-cover rounded-[2rem]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURE 1: SNAP */}
                <section id="features" className={`py-32 overflow-hidden ${neoClasses.bg}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            {/* Device Frame */}
                            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px] order-2 lg:order-1">
                                <div className={`relative rounded-[3rem] p-5 ${neoClasses.flat}`}>
                                    <div className={`overflow-hidden rounded-[2.5rem] aspect-[9/19] ${neoClasses.inset} bg-white p-2`}>
                                        <img src="/images/food_snap_mockup_1776710142023.png" alt="Snap a photo" className="w-full h-full object-cover rounded-[2rem]" />
                                    </div>
                                </div>
                            </div>

                            <div className="order-1 lg:order-2 text-center lg:text-left">
                                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800 mb-8">
                                    Track Your Food <span className="text-emerald-500">Calories</span>
                                </h2>
                                <p className="text-xl text-slate-600 mb-12 font-medium">
                                    Get the nutritional details of your meal and smart, data-driven advice.
                                </p>

                                <div className="space-y-8 mb-14 text-left">
                                    <div className={`flex p-8 rounded-[2rem] ${neoClasses.flat}`}>
                                        <div className={`flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl text-emerald-500 mr-6 ${neoClasses.inset}`}>
                                            <Apple className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-800">Identifies foods instantly.</h4>
                                            <p className="text-slate-600 mt-2 font-medium">Snap tracks your carbs, protein, and fat automatically.</p>
                                        </div>
                                    </div>
                                    <div className={`flex p-8 rounded-[2rem] ${neoClasses.flat}`}>
                                        <div className={`flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl text-emerald-500 mr-6 ${neoClasses.inset}`}>
                                            <BarChart2 className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-800">Actionable smart insights.</h4>
                                            <p className="text-slate-600 mt-2 font-medium">Ria gives you instant feedback to improve your diet.</p>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/register" className={`inline-flex px-10 py-5 rounded-2xl font-black text-lg text-emerald-600 items-center gap-3 ${neoClasses.flat} ${neoClasses.flatHover}`}>
                                    Calculate Your Calories
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURE 2: COACH RIA */}
                <section className={`py-32 ${neoClasses.bg}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="text-center lg:text-left">
                                <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800 mb-8">
                                    Try Ria - Your Personal <br /><span className="text-emerald-500">Health Coach!</span>
                                </h2>
                                <p className="text-xl text-slate-600 mb-12 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                                    Harness the power of data-driven health. Ria anticipates your needs, offering insights and notifications to steer your choices. No crash diets, only balanced nutrition.
                                </p>

                                <ul className="space-y-6 mb-14 text-left w-max mx-auto lg:mx-0">
                                    <li className="flex items-center font-bold text-slate-700 text-lg">
                                        <div className={`p-3 rounded-2xl mr-5 ${neoClasses.inset}`}><CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" /></div>
                                        Personalized Guidance On The Go
                                    </li>
                                    <li className="flex items-center font-bold text-slate-700 text-lg">
                                        <div className={`p-3 rounded-2xl mr-5 ${neoClasses.inset}`}><CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" /></div>
                                        Customised diet and workout plans
                                    </li>
                                    <li className="flex items-center font-bold text-slate-700 text-lg">
                                        <div className={`p-3 rounded-2xl mr-5 ${neoClasses.inset}`}><CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" /></div>
                                        Anytime, anywhere personal assistance
                                    </li>
                                </ul>

                                <Link href="/register" className={`inline-flex px-10 py-5 rounded-2xl font-black text-lg text-emerald-600 items-center justify-center gap-3 ${neoClasses.flat} ${neoClasses.flatHover}`}>
                                    <MessageCircle className="w-6 h-6" /> Talk to Ria Coach
                                </Link>
                            </div>

                            {/* Device Frame */}
                            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px]">
                                <div className={`relative rounded-[3rem] p-5 ${neoClasses.flat}`}>
                                    <div className={`overflow-hidden rounded-[2.5rem] aspect-[9/19] ${neoClasses.inset} bg-white p-2`}>
                                        <img src="/images/ai_coach_mockup_1776710159055.png" alt="Chat with AI Coach" className="w-full h-full object-cover rounded-[2rem]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BANNER CTA */}
                <section className={`py-32 text-center px-4 relative overflow-hidden ${neoClasses.bg}`}>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className={`p-16 rounded-[3rem] ${neoClasses.flat}`}>
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-8">
                                Ready to transform your lifestyle?
                            </h2>
                            <p className="text-xl text-slate-600 mb-14 font-medium">
                                Join millions who have successfully reached their goals using FitCore's expert-backed approach.
                            </p>
                            <Link href="/register" className={`inline-block text-emerald-600 px-12 py-5 rounded-2xl font-black text-xl ${neoClasses.flat} ${neoClasses.flatHover}`}>
                                Select a Plan
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className={`pt-20 pb-10 ${neoClasses.bg}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`p-10 rounded-[3rem] mb-10 ${neoClasses.flat}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                            <div className="col-span-2 md:col-span-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-3 rounded-2xl ${neoClasses.inset}`}>
                                        <Activity className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <span className="text-2xl font-black tracking-tight text-slate-800">Fit<span className="text-emerald-500">Core</span></span>
                                </div>
                                <p className="text-slate-600 text-sm mb-6 font-medium leading-relaxed">
                                    Empowering people globally to live healthier and happier lives.
                                </p>
                                <div className="space-y-3">
                                    <a href="mailto:support@fitcore.app" className={`inline-block font-bold text-emerald-600 px-5 py-3 rounded-2xl ${neoClasses.flatSm} ${neoClasses.flatHover}`}>support@fitcore.app</a>
                                    <br />
                                    <a href="tel:18005550199" className={`inline-block font-bold text-emerald-600 px-5 py-3 mt-2 rounded-2xl ${neoClasses.flatSm} ${neoClasses.flatHover}`}>1800-555-0199</a>
                                </div>
                            </div>

                            <div id="sports-shop">
                                <h3 className="font-black text-slate-800 mb-6 tracking-wide text-sm uppercase">Sports Shop</h3>
                                <ul className="space-y-4 text-sm font-bold text-slate-500">
                                    <li><Link href="/shop" className="hover:text-emerald-500 transition">Activewear</Link></li>
                                    <li><Link href="/shop" className="hover:text-emerald-500 transition">Footwear</Link></li>
                                    <li><Link href="/shop" className="hover:text-emerald-500 transition">Gym Equipment</Link></li>
                                    <li><Link href="/shop" className="hover:text-emerald-500 transition">Accessories</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-black text-slate-800 mb-6 tracking-wide text-sm uppercase">Features</h3>
                                <ul className="space-y-4 text-sm font-bold text-slate-500">
                                    <li><a href="#" className="hover:text-emerald-500 transition">FitCore Snap</a></li>
                                    <li><a href="#" className="hover:text-emerald-500 transition">AI Coach Ria</a></li>
                                    <li><a href="#" className="hover:text-emerald-500 transition">Meal Plans</a></li>
                                    <li><a href="#" className="hover:text-emerald-500 transition">Workouts</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm font-bold text-slate-500 px-6">
                        <div>© 2026 FitCore Inc. All rights reserved.</div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-emerald-500">Privacy Policy</a>
                            <a href="#" className="hover:text-emerald-500">Terms of Service</a>
                            <a href="#" className="hover:text-emerald-500">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}