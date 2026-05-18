import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import LottieLoader from '@/components/lottie-loader';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="dark relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-slate-950 p-6 md:p-10 text-slate-100">
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                poster="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
            >
                <source src="https://assets.mixkit.co/videos/preview/mixkit-man-training-on-a-bicycle-in-the-gym-13008-large.mp4" type="video/mp4" />
            </video>
            
            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-slate-950/60 bg-gradient-to-t from-slate-950/90 to-transparent backdrop-blur-[2px]" />

            <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-1000 ease-out">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] ring-1 ring-white/20 transition-transform hover:scale-110">
                                <AppLogoIcon className="size-8 fill-current" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
                            <p className="text-slate-300 text-sm">{description}</p>
                        </div>
                    </div>
                    
                    {/* Glassmorphism Card */}
                    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 transition-all duration-300 hover:shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                        {children}
                    </div>

                    {/* Hidden preloader — warms up animation cache immediately */}
                    <div className="hidden" aria-hidden="true">
                        <LottieLoader />
                    </div>
                </div>
            </div>
        </div>
    );
}
