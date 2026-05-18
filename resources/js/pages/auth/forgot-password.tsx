// Components
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import LottieLoader from '@/components/lottie-loader';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout title="Forgot password" description="Enter your email to receive a password reset link">
            <Head title="Forgot password" />

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6 relative">
                <form onSubmit={submit}>
                    {processing && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                            <div className="w-56 h-56 rounded-full bg-[#1a2236]/90 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                                <LottieLoader className="w-36 h-36" />
                            </div>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-emerald-500"
                        />

                        <InputError message={errors.email} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" disabled={processing}>
                            Email password reset link
                        </Button>
                    </div>
                </form>

                <div className="text-slate-300 space-x-1 text-center text-sm">
                    <span>Or, return to</span>
                    <TextLink href={route('login')} className="text-white hover:text-emerald-400 decoration-white/30 hover:decoration-emerald-400">log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
