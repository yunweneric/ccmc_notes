'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type PdfViewerProps = {
  fileUrl: string | null;
  title?: string;
  courseCode?: string;
  /**
   * Whether to show the "Open in preview" button that navigates to /preview.
   * On the preview page itself this should be false.
   */
  showPreviewButton?: boolean;
  /**
   * Layout variant:
   * - "default": card-style viewer with header and toolbar.
   * - "overlay": fullscreen-style viewer with floating bottom controls.
   */
  layoutVariant?: 'default' | 'overlay';
  /**
   * Optional close handler for overlay layouts.
   */
  onClose?: () => void;
};

export function PdfViewer({
  fileUrl,
  title,
  courseCode,
  showPreviewButton = true,
  layoutVariant = 'default',
  onClose,
}: PdfViewerProps) {
  const router = useRouter();
  const [reactPdf, setReactPdf] = useState<null | typeof import('react-pdf')>(
    null,
  );
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Polyfill Promise.withResolvers for pdfjs if needed
    if (typeof (Promise as any).withResolvers !== 'function') {
      (Promise as any).withResolvers = function withResolvers<T>() {
        let resolve!: (value: T | PromiseLike<T>) => void;
        let reject!: (reason?: unknown) => void;
        const promise = new Promise<T>((res, rej) => {
          resolve = res;
          reject = rej;
        });
        return { promise, resolve, reject };
      };
    }

    let cancelled = false;

    import('react-pdf')
      .then((mod) => {
        if (cancelled) return;
        // Configure worker src after module is loaded
        mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
        setReactPdf(mod);
      })
      .catch((error) => {
        console.error('Failed to load react-pdf:', error);
        if (!cancelled) {
          setLoadError('Unable to load PDF viewer.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!fileUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
        <p className="font-medium text-zinc-700">No note selected</p>
        <p className="mt-1 text-xs text-zinc-500">
          Choose a note from the list to view its PDF here.
        </p>
      </div>
    );
  }

  if (!reactPdf) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-zinc-200 bg-white p-4 text-xs text-zinc-500">
        Loading PDF viewer…
      </div>
    );
  }

  const { Document, Page } = reactPdf;

  const handleDocumentLoadSuccess = ({
    numPages: nextNumPages,
  }: {
    numPages: number;
  }) => {
    setNumPages(nextNumPages);
    setPageNumber(1);
    setLoadError(null);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setLoadError(
      'Unable to load PDF. The link may be restricted or blocked by CORS.',
    );
  };

  const canGoPrev = pageNumber > 1;
  const canGoNext = !!numPages && pageNumber < numPages;

  const openInPreviewScreen = () => {
    if (!fileUrl) return;
    const params = new URLSearchParams({
      title: title ?? 'Selected note',
      fileUrl,
    });
    if (courseCode) params.set('courseCode', courseCode);
    router.push(`/preview?${params.toString()}`);
  };

  const zoomControls = (
    <div className="flex items-center gap-2 text-xs">
      <button
        type="button"
        className="rounded-full border border-zinc-300 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
      >
        -
      </button>
      <span className="w-14 text-center tabular-nums text-zinc-50">
        {Math.round(scale * 100)}%
      </span>
      <button
        type="button"
        className="rounded-full border border-zinc-300 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => setScale((s) => Math.min(2, s + 0.1))}
      >
        +
      </button>
    </div>
  );

  if (layoutVariant === 'overlay') {
    return (
      <div className="relative flex h-full min-h-0 flex-col bg-black">
        <div className="flex-1 overflow-auto">
          {loadError ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center text-xs text-red-200">
              <p className="font-medium">Could not display PDF.</p>
              <p className="mt-1 text-[11px] text-red-300">
                {loadError}
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <Document
                file={fileUrl}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={handleDocumentLoadError}
                loading={
                  <div className="flex h-full items-center justify-center text-xs text-zinc-200">
                    Loading PDF…
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-black/70 px-4 py-2 text-xs text-zinc-50 shadow-lg backdrop-blur">
            {zoomControls}
            <span className="hidden text-[11px] text-zinc-300 sm:inline">
              {title ?? 'Selected note'}
            </span>
            {onClose && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 rounded-full border-zinc-500 bg-black/60 px-3 text-[11px] text-zinc-50 hover:bg-black"
                onClick={onClose}
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900">
            {title ?? 'Selected note'}
          </p>
          <p className="text-xs text-zinc-500">
            {numPages ? `Page ${pageNumber} of ${numPages}` : 'Loading PDF…'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
          >
            -
          </button>
          <span className="w-14 text-center tabular-nums text-zinc-600">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => canGoPrev && setPageNumber((p) => p - 1)}
            disabled={!canGoPrev}
          >
            Prev
          </button>
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => canGoNext && setPageNumber((p) => p + 1)}
            disabled={!canGoNext}
          >
            Next
          </button>
        </div>
        {showPreviewButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openInPreviewScreen}
          >
            Open in preview
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto rounded-md border border-zinc-200 bg-zinc-50">
        {loadError ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center text-xs text-red-600">
            <p className="font-medium">Could not display PDF inline.</p>
            <p className="mt-1 text-[11px] text-red-500">
              {loadError} You can still try opening it in a new tab using the
              link above.
            </p>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <Document
              file={fileUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              loading={
                <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                  Loading PDF…
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}


