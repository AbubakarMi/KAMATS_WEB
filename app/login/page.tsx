'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { useAuth, useBreakpoint } from '@/lib/hooks';
import { useLoginMutation } from '@/lib/features/auth/authApi';
import { setCredentials } from '@/lib/store';
import { loginSchema } from '@/lib/schemas';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import type { LoginRequest } from '@/lib/api/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [login, { isLoading, error }] = useLoginMutation();
  const { isMobile } = useBreakpoint();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (values: LoginRequest) => {
    try {
      const sanitized = sanitizeFormValues(values as unknown as Record<string, unknown>) as unknown as LoginRequest;
      const result = await login(sanitized).unwrap();
      dispatch(setCredentials(result));
      router.replace('/');
    } catch {
      // Error captured via `error` from mutation hook
    }
  };

  const apiError = error as { data?: { message?: string; code?: string } } | undefined;
  const errorMessage =
    apiError?.data?.code === 'FORBIDDEN'
      ? 'Account is locked or deactivated. Contact your administrator.'
      : apiError?.data?.message || (error ? 'Login failed. Please try again.' : null);

  return (
    <div className={`min-h-screen flex ${isMobile ? 'flex-col' : 'flex-row'} bg-[#F5F3EF]`}>
      {/* Left Panel: Brand */}
      <div
        className={`
          ${isMobile ? 'min-h-[220px] px-6 py-10' : 'flex-[0_0_44%] p-[60px]'}
          bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900
          flex flex-col justify-center items-center relative overflow-hidden
        `}
      >
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 500px 350px at 30% 40%, rgba(99,102,241,0.12) 0%, transparent 70%),
              radial-gradient(ellipse 400px 300px at 70% 65%, rgba(99,102,241,0.06) 0%, transparent 70%)
            `,
          }}
        />

        <div className="relative z-10 text-center">
          <div
            className={`
              ${isMobile ? 'w-14 h-14' : 'w-[72px] h-[72px]'}
              rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600
              flex items-center justify-center mx-auto mb-6
              shadow-[0_8px_32px_rgba(99,102,241,0.4)]
            `}
          >
            <span className={`text-white font-extrabold ${isMobile ? 'text-2xl' : 'text-[32px]'} font-[family-name:var(--font-display)] leading-none`}>
              K
            </span>
          </div>

          <h1 className={`text-stone-100 ${isMobile ? 'text-3xl' : 'text-[42px]'} font-extrabold font-[family-name:var(--font-display)] tracking-tight leading-tight mb-2`}>
            KAMATS
          </h1>
          <p className={`text-stone-500 ${isMobile ? 'text-sm' : 'text-base'} font-medium max-w-[320px] leading-relaxed`}>
            Kano Alum Management
            <br />
            & Transparency System
          </p>

          {!isMobile && (
            <div className="w-12 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 mx-auto mt-10" />
          )}
        </div>

        {!isMobile && (
          <div className="absolute bottom-8 text-stone-600 text-xs font-medium tracking-wider uppercase">
            Kano State Water Board
          </div>
        )}
      </div>

      {/* Right Panel: Form */}
      <div className={`flex-1 flex items-center justify-center ${isMobile ? 'px-6 py-8 pb-12' : 'p-12'}`}>
        <div className="max-w-[400px] w-full">
          <h2 className={`${isMobile ? 'text-2xl' : 'text-[28px]'} font-bold font-[family-name:var(--font-display)] text-stone-900 tracking-tight mb-1`}>
            Welcome back
          </h2>
          <p className="text-stone-400 text-sm font-medium mb-8">
            Sign in to your account to continue
          </p>

          {errorMessage && (
            <Alert variant="destructive" className="mb-6 rounded-xl">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[13px] font-semibold text-stone-600">
                Username
              </Label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  id="username"
                  placeholder="Enter your username"
                  autoFocus
                  className="pl-10 h-12 rounded-xl border-stone-200 bg-white shadow-sm text-sm"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 font-medium">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px] font-semibold text-stone-600">
                Password
              </Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-12 rounded-xl border-stone-200 bg-white shadow-sm text-sm"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-[15px] font-semibold font-[family-name:var(--font-display)] tracking-wide rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-[0_4px_12px_rgba(99,102,241,0.3)] mt-1 transition-all"
            >
              {isLoading && <Loader2 size={18} className="mr-2 animate-spin" />}
              Sign In
            </Button>
          </form>

          {isMobile && (
            <p className="text-center text-stone-400 text-xs mt-8 font-medium">
              Kano State Water Board
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
