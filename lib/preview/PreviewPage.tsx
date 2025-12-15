'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PdfViewer } from './components/PdfViewer';
import { Button } from '@/components/ui/button';

export function PreviewPage() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') ?? undefined;
  const fileUrl = searchParams.get('fileUrl');
  const level = searchParams.get('level') ?? undefined;
  const semester = searchParams.get('semester') ?? undefined;
  const course = searchParams.get('course') ?? undefined;

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((v) => !v);
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-zinc-900">
              Note preview
            </h1>
            <p className="mt-1 text-xs text-zinc-600">
              Optimized for mobile. Use the back button to return to the notes
              list.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
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
              <Link href="/">Back to notes</Link>
            </Button>
          </div>
        </header>

        {title || level || course ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-600">
            {course && (
              <p className="text-sm font-medium text-zinc-900">{course}</p>
            )}
            {level && semester && (
              <p className="mt-1">
                Level {level} • Semester {semester}
              </p>
            )}
            {title && (
              <p className="mt-1 text-zinc-700">
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

