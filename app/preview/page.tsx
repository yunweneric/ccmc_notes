import { Suspense } from 'react';
import { PreviewPage } from '@/lib/features/preview';

export default function PreviewRoutePage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</div>
      </div>
    }>
      <PreviewPage />
    </Suspense>
  );
}