import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface LottieLoaderProps {
    className?: string;
    text?: string;
}

// Store in window so it survives Inertia page navigations (module re-execution)
declare global {
    interface Window {
        __lottieAnimData?: any;
        __lottieAnimLoading?: boolean;
        __lottieAnimCallbacks?: Array<(data: any) => void>;
    }
}

function preloadAnim(callback?: (data: any) => void) {
    // Already cached in window
    if (window.__lottieAnimData) {
        callback?.(window.__lottieAnimData);
        return;
    }

    // Register callback for when it loads
    if (callback) {
        window.__lottieAnimCallbacks = window.__lottieAnimCallbacks || [];
        window.__lottieAnimCallbacks.push(callback);
    }

    // Already in-flight, don't re-fetch
    if (window.__lottieAnimLoading) return;

    window.__lottieAnimLoading = true;

    fetch('/animations/loading.json')
        .then((r) => r.json())
        .then((data) => {
            window.__lottieAnimData = data;
            window.__lottieAnimLoading = false;
            // Fire all pending callbacks
            (window.__lottieAnimCallbacks || []).forEach((cb) => cb(data));
            window.__lottieAnimCallbacks = [];
        })
        .catch((err) => {
            console.error('LottieLoader: failed to load animation:', err);
            window.__lottieAnimLoading = false;
        });
}

// Kick off the fetch immediately when this module loads
preloadAnim();

export default function LottieLoader({ className, text }: LottieLoaderProps) {
    const [animationData, setAnimationData] = useState<any>(
        typeof window !== 'undefined' ? window.__lottieAnimData : null
    );

    useEffect(() => {
        if (window.__lottieAnimData) {
            setAnimationData(window.__lottieAnimData);
        } else {
            preloadAnim((data) => setAnimationData(data));
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div className={cn('w-32 h-32', className)}>
                {animationData ? (
                    <Lottie
                        animationData={animationData}
                        loop={true}
                        autoplay={true}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-emerald-400 animate-spin" />
                    </div>
                )}
            </div>
            {text && (
                <p className="font-medium text-white/80 animate-pulse text-sm tracking-widest uppercase">
                    {text}
                </p>
            )}
        </div>
    );
}
