'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthContext } from './auth_provider';
import { useTranslation } from '@/lib/features/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login, loading, error: authError } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = t('auth.emailRequired');
    } else if (!validateEmail(email)) {
      newErrors.email = t('auth.invalidEmail');
    }
    if (!password.trim()) {
      newErrors.password = t('auth.passwordRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      toast.success(t('auth.loginSuccess') || 'Login successful');
      // Redirect to home page on successful login
      router.push('/');
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('auth.loginError');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  const isLoading = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email')}
            className={cn(
              'pl-10 h-11',
              errors.email && 'border-red-500 dark:border-red-500 focus-visible:ring-red-500'
            )}
            disabled={isLoading}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </div>
        {errors.email && (
          <p
            id="email-error"
            className="text-xs text-red-600 dark:text-red-400 px-1"
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.password')}
            className={cn(
              'pl-10 pr-10 h-11',
              errors.password && 'border-red-500 dark:border-red-500 focus-visible:ring-red-500'
            )}
            disabled={isLoading}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={isLoading}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="password-error"
            className="text-xs text-red-600 dark:text-red-400 px-1"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-sm font-medium"
        disabled={isLoading}
        size="md"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('auth.processing')}
          </>
        ) : (
          t('auth.loginButton')
        )}
      </Button>
    </form>
  );
}

