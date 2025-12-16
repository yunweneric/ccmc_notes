'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './auth_provider';
import { useTranslation } from '@/lib/features/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login, loading, error: authError } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);

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
      // Redirect to home page on successful login
      router.push('/');
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : t('auth.loginError')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;
  const displayError = submitError || authError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {t('auth.email')}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            className={cn(
              'pl-10',
              errors.email && 'border-red-500 dark:border-red-500'
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
            className="text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {t('auth.password')}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            className={cn(
              'pl-10',
              errors.password && 'border-red-500 dark:border-red-500'
            )}
            disabled={isLoading}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
        </div>
        {errors.password && (
          <p
            id="password-error"
            className="text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>

      {displayError && (
        <div
          className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3"
          role="alert"
        >
          <p className="text-sm text-red-800 dark:text-red-200">
            {displayError}
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        size="md"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('auth.loggingIn')}
          </>
        ) : (
          t('auth.loginButton')
        )}
      </Button>
    </form>
  );
}

