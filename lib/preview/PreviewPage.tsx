'use client';

import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { PdfViewer } from './components/PdfViewer';
import { useTranslation } from '@/lib/i18n/hooks';

export function PreviewPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const title = searchParams.get('title') ?? undefined;
  const fileUrl = searchParams.get('fileUrl');
  const courseCode = searchParams.get('courseCode') ?? undefined;

  // Handle Escape key to exit preview
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [router]);

  // Show toast on mount for large screens
  useEffect(() => {
    const isLargeScreen = window.innerWidth >= 768;
    if (isLargeScreen) {
      toast.info(t('preview.pressEscapeToExit'), {
        duration: 3000,
      });
    }
  }, [t]);

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-950">
      <PdfViewer
        fileUrl={fileUrl}
        title={title}
        courseCode={courseCode}
        showPreviewButton={false}
        layoutVariant="overlay"
        onClose={handleClose}
      />
    </div>
  );
}

