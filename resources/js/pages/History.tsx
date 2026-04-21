import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Activity, Calendar } from 'lucide-react';

interface PageProps {
    currentMonth: number;
    currentYear: number;
    monthName: string;
    totalDaysInMonth: number;
    firstDayOfWeek: number;
    dailyTotals: Record<string, number>;
    dailyGoal: number;
}

export default function History() {
    const { currentMonth, currentYear, monthName, totalDaysInMonth, firstDayOfWeek, dailyTotals, dailyGoal } = usePage().props as unknown as PageProps;

    const navigateMonth = (direction: 'PREV' | 'NEXT') => {
        let nMonth = currentMonth;
        let nYear = currentYear;
        
        if (direction === 'PREV') {
            nMonth--;
            if (nMonth < 1) {
                nMonth = 12;
                nYear--;
            }
        } else {
            nMonth++;
            if (nMonth > 12) {
                nMonth = 1;
                nYear++;
            }
        }
        router.get('/history', { month: nMonth, year: nYear });
    };

    const generateGrid = () => {
        const days = [];
        // Fill empty padding for pre-month days based on firstDayOfWeek offset
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(<div key={`pad-${i}`} className="h-20 sm:h-24 opacity-0 border border-transparent"></div>);
        }

        // Fill actual days
        for (let day = 1; day <= totalDaysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const cals = dailyTotals[dateStr] || 0;
            const hasData = cals > 0;
            const isPerfect = cals > 0 && cals <= dailyGoal + 100; // leeway for perfect tracking
            const isOver = cals > dailyGoal + 100;
            
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            days.push(
                <div 
                    key={`day-${day}`} 
                    onClick={() => {
                        if (hasData) {
                            router.get('/insights', { date: dateStr });
                        }
                    }}
                    className={`h-22 sm:h-24 p-1 sm:p-2 border border-slate-100 dark:border-slate-800 transition rounded-xl flex flex-col items-center justify-start pt-2 cursor-pointer 
                        ${hasData ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700' : 'opacity-40 pointer-events-none'} 
                        ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : 'bg-white dark:bg-slate-900'}`
                    }
                >
                    <span className={`text-[13px] font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>
                        {day}
                    </span>
                    
                    {hasData && (
                        <div className="flex flex-col items-center mt-1 w-full gap-1">
                            <div className={`text-[10px] sm:text-xs font-bold px-1 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis w-[95%] text-center
                                ${isOver ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}
                            `}>
                                {cals} Cal
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <Head title="Calendar History" />
            
            <div className="bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center justify-between p-4 px-5 border-b border-slate-100 dark:border-slate-800">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <ArrowLeft className="w-6 h-6 text-slate-800 dark:text-white" />
                    </Link>

                    <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        Tracking Calendar
                    </h1>
                    
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto w-full p-4 space-y-6 mt-2">
                
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <button onClick={() => navigateMonth('PREV')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-500" /> {monthName} {currentYear}
                        </h2>
                        <span className="text-xs text-slate-400 font-medium">Click on any tracked day to view detailed insights.</span>
                    </div>

                    <button onClick={() => navigateMonth('NEXT')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[28px] p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 mb-2">
                        {daysOfWeek.map(day => (
                            <div key={day} className="text-center font-bold text-[11px] sm:text-xs text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100 dark:border-slate-800">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2 mt-4">
                        {generateGrid()}
                    </div>
                    
                </div>
                
            </div>
        </div>
    );
}
