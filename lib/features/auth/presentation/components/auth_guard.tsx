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

