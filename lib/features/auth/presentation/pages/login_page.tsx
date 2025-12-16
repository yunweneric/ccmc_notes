'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthContext } from '../components/auth_provider';
import { LoginForm } from '../components/login_form';
import { useTranslation } from '@/lib/features/i18n';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
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
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Left side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2 lg:px-8 relative">
        {/* Theme and Language Switchers */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                CCMC Notes
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {t('auth.welcome')}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t('auth.loginDescription')}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {t('auth.login')}
            </h3>
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {t('auth.adminNote')}
          </p>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/images/login_youth.jpg"
          alt="Student with books"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center h-full w-full">
          <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 shadow-xl backdrop-blur-sm">
            <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white text-center">
            Your Course Notes Library
          </h2>
          <p className="max-w-md text-lg text-white/90 text-center mx-auto">
            Access your course materials, manage your schedule, and stay organized with CCMC Notes.
          </p>
        </div>
      </div>
    </div>
  );
}

