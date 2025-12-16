'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from './auth_provider';
import { Role } from '@/lib/features/auth/data/interfaces/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    // Wait for auth state to load
    if (loading) {
      return;
    }

    // If user is authenticated and on login page, redirect them away
    if (user && pathname === '/login') {
      // Check if user is admin and redirect to dashboard, otherwise go to home
      if (user.role?.name === Role.ADMIN) {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
      return;
    }

    // Redirect to login if not authenticated and not on login page
    if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

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

