import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import LottieLoader from '@/components/lottie-loader';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
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
                        <Label htmlFor="name" className="text-white">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-emerald-500"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-emerald-500"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-emerald-500"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-white">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-emerald-500"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white" tabIndex={5} disabled={processing}>
                        Create account
                    </Button>
                </div>

                <div className="text-slate-300 text-center text-sm">
                    Already have an account?{' '}
                    <TextLink href={route('login')} className="text-white hover:text-emerald-400 decoration-white/30 hover:decoration-emerald-400" tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
