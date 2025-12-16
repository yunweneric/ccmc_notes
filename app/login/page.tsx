import { Suspense } from 'react';
import { LoginPage } from '@/lib/features/auth';

export default function LoginRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading...
          </div>
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}

