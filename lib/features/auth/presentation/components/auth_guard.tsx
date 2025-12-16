'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from './auth_provider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    // Don't redirect if we're already on the login page
    if (pathname === '/login') {
      return;
    }

    // Wait for auth state to load
    if (loading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading...
        </div>
      </div>
    );
  }

  // Allow login page to render without auth
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Don't render children if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

