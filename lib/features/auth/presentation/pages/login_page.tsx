'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../components/auth_provider';
import { LoginForm } from '../components/login_form';
import { useTranslation } from '@/lib/features/i18n';
import { BookOpen } from 'lucide-react';

export function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loading } = useAuthContext();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {t('auth.welcome')}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t('auth.loginDescription')}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t('auth.login')}
          </h2>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          {t('auth.adminNote')}
        </p>
      </div>
    </div>
  );
}

