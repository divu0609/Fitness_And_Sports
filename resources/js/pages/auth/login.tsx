import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import LottieLoader from '@/components/lottie-loader';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6 relative" onSubmit={submit}>
                {processing && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <div className="w-56 h-56 rounded-full bg-[#1a2236]/90 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                            <LottieLoader className="w-36 h-36" />
                        </div>
                    </div>
                )}
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-emerald-500"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm text-slate-300 hover:text-white decoration-white/30 hover:decoration-white" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-emerald-500"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox id="remember" name="remember" tabIndex={3} className="border-white/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white" />
                        <Label htmlFor="remember" className="text-white">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white" tabIndex={4} disabled={processing}>
                        Log in
                    </Button>
                </div>

                <div className="text-slate-300 text-center text-sm">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} className="text-white hover:text-emerald-400 decoration-white/30 hover:decoration-emerald-400" tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-400">{status}</div>}
        </AuthLayout>
    );
}
