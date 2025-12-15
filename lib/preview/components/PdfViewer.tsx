'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { createPluginRegistration } from '@embedpdf/core';
import { EmbedPDF } from '@embedpdf/core/react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
// Import the essential plugins (based on EmbedPDF docs)
import { Viewport, ViewportPluginPackage } from '@embedpdf/plugin-viewport/react';
import { Scroller, ScrollPluginPackage, useScroll } from '@embedpdf/plugin-scroll/react';
import { LoaderPluginPackage } from '@embedpdf/plugin-loader/react';
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react';
import { ThumbnailsPane, ThumbImg, ThumbnailPluginPackage } from '@embedpdf/plugin-thumbnail/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/hooks';

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
   * - "default": card-style viewer.
   * - "overlay": fullscreen-style viewer with floating close button.
   */
  layoutVariant?: 'default' | 'overlay';
  /**
   * Optional close handler for overlay layouts.
   */
  onClose?: () => void;
  /**
   * Optional fullscreen handler for default layouts.
   */
  onFullscreen?: () => void;
};

// 1. Helper to register plugins for a given URL (adapted from docs)
function createPluginsForUrl(fileUrl: string, includeThumbnails = false) {
  const basePlugins = [
    createPluginRegistration(LoaderPluginPackage, {
      loadingOptions: {
        type: 'url',
        pdfFile: {
          id: fileUrl,
          url: fileUrl,
        },
      },
    }),
    createPluginRegistration(ViewportPluginPackage),
    createPluginRegistration(ScrollPluginPackage),
    createPluginRegistration(RenderPluginPackage),
  ];

  // Add thumbnail plugin if requested (for fullscreen mode)
  // Dependencies (Render and Scroll) are already registered above
  if (includeThumbnails) {
    return [
      ...basePlugins,
      createPluginRegistration(ThumbnailPluginPackage, {
        width: 120, // Thumbnail width in CSS pixels
        gap: 8, // Vertical space between thumbnails
        autoScroll: true, // Auto-scroll sidebar to current page
      }),
    ];
  }

  return basePlugins;
}

// Thumbnail Sidebar Component (for overlay/fullscreen mode)
function ThumbnailSidebar({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const { state, provides } = useScroll();

  return (
    <div
      className={`relative shrink-0 border-r border-zinc-800 bg-zinc-900 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-0 overflow-hidden' : 'w-[160px]'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-lg transition-colors hover:bg-zinc-700 hover:text-white"
        aria-label={isCollapsed ? t('pdfViewer.showThumbnails') : t('pdfViewer.hideThumbnails')}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {!isCollapsed && (
        <>
          {/* Sidebar Header */}
          <div className="border-b border-zinc-800 px-3 py-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {t('pdfViewer.pages')}
            </h3>
          </div>

          {/* Thumbnails Container */}
          <div className="h-full overflow-y-auto pb-4">
            <ThumbnailsPane>
              {(m) => {
                const isActive = state.currentPage === m.pageIndex + 1;
                return (
                  <div
                    key={m.pageIndex}
                    style={{
                      position: 'absolute',
                      top: m.top,
                      height: m.wrapperHeight,
                      width: '100%',
                      padding: '0 12px',
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      provides?.scrollToPage({ pageNumber: m.pageIndex + 1 })
                    }
                    className="transition-opacity hover:opacity-80"
                  >
                    <div
                      style={{
                        border: `2px solid ${isActive ? '#3b82f6' : '#404040'}`,
                        borderRadius: '6px',
                        width: m.width,
                        height: m.height,
                        backgroundColor: '#1a1a1a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border-color 0.2s',
                      }}
                      className={isActive ? 'ring-2 ring-blue-500/50' : ''}
                    >
                      <ThumbImg meta={m} />
                    </div>
                    <span
                      style={{
                        height: m.labelHeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: isActive ? '#60a5fa' : '#9ca3af',
                        fontWeight: isActive ? '600' : '400',
                        marginTop: '4px',
                      }}
                    >
                      {m.pageIndex + 1}
                    </span>
                  </div>
                );
              }}
            </ThumbnailsPane>
          </div>
        </>
      )}
    </div>
  );
}

export function PdfViewer({
  fileUrl,
  title,
  courseCode,
  showPreviewButton = true,
  layoutVariant = 'default',
  onClose,
  onFullscreen,
}: PdfViewerProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // 2. Initialize the engine with the React hook (from docs)
  const { engine, isLoading } = usePdfiumEngine();
  
  // Move useState to top level - hooks must be called unconditionally
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode is active
  const isDark = mounted && (resolvedTheme === 'dark' || (theme === 'system' && resolvedTheme === 'dark'));

  const openInPreviewPage = () => {
    if (!fileUrl) return;
    const params = new URLSearchParams({
      title: title ?? 'Selected note',
      fileUrl,
    });
    if (courseCode) params.set('courseCode', courseCode);
    router.push(`/preview?${params.toString()}`);
  };

  // 1 (cont.). Register plugins when we have a URL
  // Include thumbnails plugin for overlay (fullscreen) mode
  const plugins = useMemo(
    () => (fileUrl ? createPluginsForUrl(fileUrl, layoutVariant === 'overlay') : []),
    [fileUrl, layoutVariant],
  );

  if (!fileUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('pdfViewer.noNoteSelected')}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {t('pdfViewer.chooseNoteFromList')}
        </p>
      </div>
    );
  }

  // While the engine is loading, show a spinner-style message
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-xs text-zinc-500 dark:text-zinc-400">
        {t('pdfViewer.loadingPdfViewer')}
      </div>
    );
  }

  // If the engine failed to initialize, show an explicit error instead of a
  // permanent loading state.
  if (!engine || plugins.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-4 text-center text-xs text-red-700 dark:text-red-400">
        <p className="font-medium">{t('pdfViewer.unableToInitialize')}</p>
        <p className="mt-1 text-[11px] text-red-500 dark:text-red-500">
          {t('pdfViewer.engineFailedToLoad')}
        </p>
      </div>
    );
  }

  if (layoutVariant === 'overlay') {
    return (
      <div className="relative flex h-full flex-col bg-zinc-950">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {courseCode && (
              <div className="shrink-0 rounded bg-zinc-800 px-2 py-1">
                <span className="text-xs font-medium text-zinc-300">
                  {courseCode}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-zinc-100">
                {title ?? 'PDF Document'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800/50 p-0 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={isSidebarCollapsed ? t('pdfViewer.showThumbnails') : t('pdfViewer.hideThumbnails')}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
            {onClose && (
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800/50 p-0 text-zinc-300 transition-colors hover:bg-red-600/20 hover:border-red-600/50 hover:text-red-400"
                onClick={onClose}
                aria-label={t('pdfViewer.closeFullscreen')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <EmbedPDF engine={engine} plugins={plugins}>
          <div className="flex flex-1 overflow-hidden">
            {/* Thumbnail Sidebar */}
            <ThumbnailSidebar
              isCollapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main PDF Viewport */}
            <div className="flex-1 min-w-0 bg-zinc-950">
              <Viewport
                style={{
                  backgroundColor: '#09090b',
                  height: '100%',
                }}
              >
                <Scroller
                  renderPage={({ width, height, pageIndex, scale }) => (
                    <div
                      style={{
                        width,
                        height,
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '2rem 0',
                      }}
                    >
                      <RenderLayer pageIndex={pageIndex} scale={scale} />
                    </div>
                  )}
                />
              </Viewport>
            </div>
          </div>
        </EmbedPDF>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {title ?? t('common.loading')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showPreviewButton && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openInPreviewPage}
              >
                {t('pdfViewer.openInPreview')}
              </Button>
              {onFullscreen && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onFullscreen}
                  aria-label={t('pdfViewer.enterFullscreen')}
                >
                  <span className="text-xs">⤢</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <EmbedPDF engine={engine} plugins={plugins}>
          <Viewport
            style={{
              backgroundColor: isDark ? '#09090b' : '#f4f4f5',
              height: '100%',
            }}
          >
            <Scroller
              renderPage={({ width, height, pageIndex, scale }) => (
                <div
                  style={{
                    width,
                    height,
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '0.75rem 0',
                  }}
                >
                  <RenderLayer pageIndex={pageIndex} scale={scale} />
                </div>
              )}
            />
          </Viewport>
        </EmbedPDF>
      </div>
    </div>
  );
}
