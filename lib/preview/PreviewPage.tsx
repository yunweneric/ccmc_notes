'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PdfViewer } from './components/PdfViewer';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n/hooks';

export function PreviewPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const title = searchParams.get('title') ?? undefined;
  const fileUrl = searchParams.get('fileUrl');
  const level = searchParams.get('level') ?? undefined;
  const semester = searchParams.get('semester') ?? undefined;
  const course = searchParams.get('course') ?? undefined;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Check if screen is large (desktop)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768); // md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    const newValue = !isFullscreen;
    setIsFullscreen(newValue);

    // Show toast only when entering fullscreen and on large screens
    if (newValue && isLargeScreen) {
      toast.info(t('preview.pressEscapeToExit'), {
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-6 text-zinc-900 dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('preview.title')}
            </h1>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {t('preview.description')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={isFullscreen ? t('pdfViewer.exitFullscreen') : t('pdfViewer.enterFullscreen')}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                // simple \"collapse\" icon
                <span className="text-lg leading-none">⤺</span>
              ) : (
                // simple \"expand\" icon
                <span className="text-lg leading-none">⤢</span>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Link href="/">{t('preview.backToNotes')}</Link>
            </Button>
          </div>
        </header>

        {title || level || course ? (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs text-zinc-600 dark:text-zinc-400">
            {course && (
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{course}</p>
            )}
            {level && semester && (
              <p className="mt-1">
                {t('preview.levelSemester', { level, semester })}
              </p>
            )}
            {title && (
              <p className="mt-1 text-zinc-700 dark:text-zinc-300">
                {title}
              </p>
            )}
          </div>
        ) : null}

        <div className="h-[70vh]">
          <PdfViewer
            fileUrl={fileUrl}
            title={title}
            showPreviewButton={false}
          />
        </div>
      </main>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <PdfViewer
            fileUrl={fileUrl}
            title={title}
            showPreviewButton={false}
            layoutVariant="overlay"
            onClose={toggleFullscreen}
          />
        </div>
      )}
    </div>
  );
}

