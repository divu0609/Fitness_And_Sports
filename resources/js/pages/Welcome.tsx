import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import { Activity, Apple, MessageCircle, BarChart2, Smartphone, CheckCircle, ChevronRight, Menu, X } from "lucide-react";
export default function Welcome() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [bmi, setBmi] = useState(null);
    const [category, setCategory] = useState("");

    const calculateBMI = () => {
        if (!height || !weight) return;

        const heightInMeters = height / 100;
        const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(2);

        setBmi(bmiValue);

        // BMI Category Logic
        if (bmiValue < 18.5) setCategory("Underweight");
        else if (bmiValue < 24.9) setCategory("Normal");
        else if (bmiValue < 29.9) setCategory("Overweight");
        else setCategory("Obese");
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
                        <a href="#blog" className="hover:text-emerald-600 transition">Blog</a>
                        <a href="#support" className="hover:text-emerald-600 transition">Support</a>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login" className="text-slate-900 font-semibold hover:text-emerald-600 transition">
                            Log in
                        </Link>
                        <Link href="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-emerald-600 transition shadow-lg hover:shadow-emerald-500/30">
                            Get App
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
                        <Link href="/login" className="font-semibold text-slate-600 hover:text-emerald-600">Log in</Link>
                        <Link href="/register" className="bg-slate-900 text-center text-white px-5 py-3 rounded-xl font-semibold mt-2">
                            Get App
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
                                    Meet FitCore. AI health made easy.
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                                    Health Made <br className="hidden lg:block" /> Easy <span className="text-emerald-600 italic">With AI.</span>
                                </h1>
                                <p className="mt-4 text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0">
                                    Improve your nutrition with FitCore Snap's advanced meal tracking & meet Ria, your personalized AI coach. Accelerate your fitness goals to a whole new level.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link href="/register" className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2">
                                        Try FitCore Snap <ChevronRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="/register" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition flex items-center justify-center gap-2 shadow-sm">
                                        Talk to AI Coach
                                    </Link>
                                </div>
                                <div className="bg-white text-center py-16">

                                    <h2 className="text-3xl font-bold mb-6">BMI Calculator</h2>

                                    <div className="flex flex-col items-center gap-4">

                                        <input
                                            type="number"
                                            placeholder="Height (cm)"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            className="border p-2 rounded w-64"
                                        />

                                        <input
                                            type="number"
                                            placeholder="Weight (kg)"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className="border p-2 rounded w-64"
                                        />

                                        <button
                                            onClick={calculateBMI}
                                            className="bg-green-500 text-white px-6 py-2 rounded"
                                        >
                                            Calculate BMI
                                        </button>

                                        {bmi && (
                                            <div className="mt-4">
                                                <p className="text-xl font-semibold">BMI: {bmi}</p>
                                                <p className="text-lg">Category: {category}</p>
                                            </div>
                                        )}
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
                                    Track Your Food <br />With <span className="text-emerald-600">Just a Snap.</span>
                                </h2>
                                <p className="text-xl text-slate-600 mb-8">
                                    Snap your meal for instant nutritional details and smart, AI-driven advice from Coach Ria.
                                </p>

                                <div className="space-y-6 mb-10 text-left">
                                    <div className="flex bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">Snap a photo of your meal.</h4>
                                            <p className="text-slate-500 mt-1">Let the AI do the heavy lifting of measuring portions.</p>
                                        </div>
                                    </div>
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
                                            <h4 className="text-lg font-bold text-slate-900">Actionable AI insights.</h4>
                                            <p className="text-slate-500 mt-1">Ria gives you instant feedback to improve your diet.</p>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/register" className="inline-flex bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-600 transition shadow-lg items-center gap-2">
                                    Try Snap with a Photo
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
                                    Try Ria - Your Personal <br /><span className="text-emerald-600">AI Health Coach!</span>
                                </h2>
                                <p className="text-xl text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0">
                                    Harness the power of data-driven health. AI Ria anticipates your needs, offering insights and notifications to steer your choices. No crash diets, only balanced nutrition.
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
                                    <MessageCircle className="w-5 h-5" /> Talk to AI Coach Ria
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

                        <div className="col-span-2 md:col-span-1">
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
                        </div>
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