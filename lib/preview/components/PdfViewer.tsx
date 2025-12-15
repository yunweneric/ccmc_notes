'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { createPluginRegistration } from '@embedpdf/core';
import { EmbedPDF } from '@embedpdf/core/react';
import { usePdfiumEngine } from '@embedpdf/engines/react';
// Import the essential plugins
import { Viewport, ViewportPluginPackage } from '@embedpdf/plugin-viewport/react';
import { Scroller, ScrollPluginPackage, useScroll } from '@embedpdf/plugin-scroll/react';
import { LoaderPluginPackage, useLoaderCapability } from '@embedpdf/plugin-loader/react';
import { RenderLayer, RenderPluginPackage } from '@embedpdf/plugin-render/react';
import { ThumbnailsPane, ThumbImg, ThumbnailPluginPackage } from '@embedpdf/plugin-thumbnail/react';
// Import new plugins
import { TilingLayer, TilingPluginPackage } from '@embedpdf/plugin-tiling/react';
import { InteractionManagerPluginPackage, PagePointerProvider } from '@embedpdf/plugin-interaction-manager/react';
import { SelectionLayer, SelectionPluginPackage, useSelectionCapability } from '@embedpdf/plugin-selection/react';
import { ZoomPluginPackage, useZoomCapability } from '@embedpdf/plugin-zoom/react';
import { PrintPluginPackage, usePrintCapability } from '@embedpdf/plugin-print/react';
import { ExportPluginPackage, useExportCapability } from '@embedpdf/plugin-export/react';
import { SpreadPluginPackage, useSpreadCapability, SpreadMode } from '@embedpdf/plugin-spread/react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2, Printer, Download, Copy, PanelRightOpen } from 'lucide-react';
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

// Helper to register plugins for a given URL
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
    // Register tiling plugin for performance (depends on Render, Scroll, Viewport)
    createPluginRegistration(TilingPluginPackage, {
      tileSize: 768,
      overlapPx: 5,
      extraRings: 1, // Pre-render one ring of tiles outside the viewport
    }),
    // Register interaction manager for selection
    createPluginRegistration(InteractionManagerPluginPackage),
    // Register selection plugin (depends on InteractionManager)
    createPluginRegistration(SelectionPluginPackage),
    // Register zoom plugin
    createPluginRegistration(ZoomPluginPackage),
    // Register print plugin
    createPluginRegistration(PrintPluginPackage),
    // Register export plugin
    createPluginRegistration(ExportPluginPackage),
    // Register spread plugin
    createPluginRegistration(SpreadPluginPackage),
  ];

  // Add thumbnail plugin if requested (for fullscreen mode)
  // Dependencies (Render and Scroll) are already registered above
  if (includeThumbnails) {
    return [
      ...basePlugins,
      createPluginRegistration(ThumbnailPluginPackage, {
        width: 80,
        gap: 6,
        autoScroll: true,
      }),
    ];
  }

  return basePlugins;
}

// Thumbnail Sidebar Component (for overlay/fullscreen mode)
function ThumbnailSidebar({
  isCollapsed,
  onToggle,
  isMobile = false,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}) {
  const { t } = useTranslation();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { state, provides } = useScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Override ThumbnailsPane inline height styles (372px -> auto)
  useEffect(() => {
    const overrideThumbnailHeights = () => {
      // Find all divs with inline style containing "372px"
      const allDivs = document.querySelectorAll('div[style*="372px"]');
      allDivs.forEach((div) => {
        const element = div as HTMLElement;
        const computedHeight = window.getComputedStyle(element).height;
        const inlineStyle = element.getAttribute('style') || '';
        
        // Check if element has height: 372px in inline style or computed style
        if (inlineStyle.includes('372px') || computedHeight === '372px') {
          // Directly set height to auto using style property (overrides inline styles)
          element.style.height = 'auto';
          
          // Also update the style attribute to persist the change
          if (inlineStyle) {
            let newStyle = inlineStyle
              .replace(/height:\s*372px\s*;?/gi, '')
              .replace(/height:372px\s*;?/gi, '')
              .replace(/height\s*:\s*372px\s*;?/gi, '');
            
            // Clean up any double semicolons or trailing/leading issues
            newStyle = newStyle.replace(/;\s*;/g, ';').trim();
            if (newStyle && !newStyle.endsWith(';')) {
              newStyle += ';';
            }
            newStyle += ' height: auto;';
            
            element.setAttribute('style', newStyle);
          } else {
            element.setAttribute('style', 'height: auto;');
          }
        }
      });
    };

    // Run immediately
    overrideThumbnailHeights();

    // Set up MutationObserver to catch dynamically added elements and style changes
    const observer = new MutationObserver((mutations) => {
      let shouldRun = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement;
          const style = target.getAttribute('style') || '';
          if (style.includes('372px')) {
            shouldRun = true;
          }
        } else if (mutation.type === 'childList') {
          shouldRun = true;
        }
      });
      if (shouldRun) {
        // Use requestAnimationFrame to batch updates
        requestAnimationFrame(overrideThumbnailHeights);
      }
    });

    // Observe the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    });

    // Also run periodically as a fallback (less frequent to reduce overhead)
    const interval = setInterval(() => {
      requestAnimationFrame(overrideThumbnailHeights);
    }, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || (theme === 'system' && resolvedTheme === 'dark'));

  // For mobile, render horizontal scrolling thumbnails
  if (isMobile) {
    return (
      <div className="w-full h-full overflow-x-auto overflow-y-hidden flex flex-col items-center justify-center" style={{ whiteSpace: 'nowrap' }}>
        <div className="inline-flex items-center gap-2 px-2">
          <ThumbnailsPane>
            {(m) => {
              const isActive = state.currentPage === m.pageIndex + 1;
              return (
                <div
                  key={m.pageIndex}
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: `${m.width + 16}px`,
                    minWidth: `${m.width + 16}px`,
                    padding: '4px 6px',
                    cursor: 'pointer',
                    justifyContent: 'center',
                  }}
                  onClick={() =>
                    provides?.scrollToPage({ pageNumber: m.pageIndex + 1 })
                  }
                  className="transition-opacity hover:opacity-80"
                >
                  <div
                    style={{
                      border: `2px solid ${isActive ? '#3b82f6' : isDark ? '#404040' : '#d4d4d8'}`,
                      borderRadius: '4px',
                      width: m.width,
                      height: m.height,
                      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'border-color 0.2s',
                      overflow: 'hidden',
                      flexShrink: 0,
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
                      fontSize: '10px',
                      color: isActive ? '#60a5fa' : isDark ? '#9ca3af' : '#6b7280',
                      fontWeight: isActive ? '600' : '400',
                      marginTop: '2px',
                    }}
                  >
                    {m.pageIndex + 1}
                  </span>
                </div>
              );
            }}
          </ThumbnailsPane>
        </div>
      </div>
    );
  }

  // Desktop vertical sidebar
  return (
    <div
      className={`relative shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-0 overflow-hidden' : 'w-[110px]'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
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
          <div className="border-b border-zinc-200 dark:border-zinc-800 px-3 py-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
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
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                    onClick={() =>
                      provides?.scrollToPage({ pageNumber: m.pageIndex + 1 })
                    }
                    className="transition-opacity hover:opacity-80"
                  >
                    <div
                      style={{
                        border: `2px solid ${isActive ? '#3b82f6' : isDark ? '#404040' : '#d4d4d8'}`,
                        borderRadius: '0px',
                        width: m.width,
                        height: m.height,
                        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border-color 0.2s',
                        overflow: 'hidden',
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

// Toolbar component for overlay mode
function PdfToolbar({
  onClose,
  onToggleSidebar,
  isSidebarCollapsed,
  title,
  isMobile = false,
  onZoomChange,
  onSpreadChange,
}: {
  onClose?: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  title?: string;
  isMobile?: boolean;
  onZoomChange?: () => void;
  onSpreadChange?: () => void;
}) {
  const { t } = useTranslation();
  const zoom = useZoomCapability();
  const print = usePrintCapability();
  const exportCap = useExportCapability();
  const spread = useSpreadCapability();
  const selection = useSelectionCapability();

  const [spreadMode, setSpreadMode] = useState<'none' | 'odd' | 'even'>('none');

  // Debug: Log plugin availability
  useEffect(() => {
    console.log('Plugin capabilities:', {
      zoom: !!zoom.provides,
      print: !!print.provides,
      export: !!exportCap.provides,
      spread: !!spread.provides,
      selection: !!selection.provides,
    });
  }, [zoom.provides, print.provides, exportCap.provides, spread.provides, selection.provides]);

  const handleZoomIn = () => {
    if (zoom.provides) {
      try {
        onZoomChange?.();
        zoom.provides.zoomIn();
      } catch (error) {
        console.error('Zoom in error:', error);
      }
    }
  };

  const handleZoomOut = () => {
    if (zoom.provides) {
      try {
        onZoomChange?.();
        zoom.provides.zoomOut();
      } catch (error) {
        console.error('Zoom out error:', error);
      }
    }
  };

  const handleZoomFit = () => {
    // Zoom to fit - placeholder for future implementation
    // The zoom plugin may need scroll plugin integration for fit-to-page
    console.log('Zoom fit - feature coming soon');
  };

  const handleZoomActual = () => {
    // Reset zoom to 100% - placeholder for future implementation
    console.log('Zoom actual - feature coming soon');
  };

  const handlePrint = () => {
    if (print.provides) {
      try {
        print.provides.print();
      } catch (error) {
        console.error('Print error:', error);
      }
    }
  };

  const handleExportPdf = async () => {
    if (exportCap.provides) {
      try {
        // Try to get PDF blob for custom filename
        // Check if exportPdf method exists
        if ('exportPdf' in exportCap.provides && typeof (exportCap.provides as any).exportPdf === 'function') {
          const result = (exportCap.provides as any).exportPdf();
          if (result && typeof result.wait === 'function') {
            const blob = await result.wait();
            const filename = title ? `${title.replace(/[^a-z0-9]/gi, '_')}.pdf` : 'document.pdf';
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return;
          }
        }
        // Fallback: use download method (may not support custom filename)
        exportCap.provides.download();
      } catch (error) {
        console.error('Export error:', error);
        // Final fallback
        try {
          exportCap.provides.download();
        } catch (fallbackError) {
          console.error('Export fallback error:', fallbackError);
        }
      }
    }
  };

  const handleCopyText = () => {
    if (selection.provides) {
      try {
        selection.provides.copyToClipboard();
      } catch (error) {
        console.error('Copy text error:', error);
      }
    }
  };

  const handleSpreadChange = (mode: 'none' | 'odd' | 'even') => {
    setSpreadMode(mode);
    onSpreadChange?.();
    if (spread.provides) {
      if (mode === 'none') {
        spread.provides.setSpreadMode(SpreadMode.None);
      } else if (mode === 'odd') {
        spread.provides.setSpreadMode(SpreadMode.Odd);
      } else {
        spread.provides.setSpreadMode(SpreadMode.Even);
      }
    }
  };

  const hasZoom = !!zoom.provides;
  const hasPrint = !!print.provides;
  const hasExport = !!exportCap.provides;
  const hasSelection = !!selection.provides;
  const hasSpread = !!spread.provides;

  return (
    <div className={`flex items-center ${isMobile ? 'flex-row w-full justify-between' : 'flex-row gap-1.5'}`}>
      {/* Zoom Controls */}
      <ButtonGroup className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 overflow-hidden">
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          onClick={handleZoomOut}
          disabled={!hasZoom}
          className={`${isMobile ? 'h-7 w-7 p-0' : 'h-9 w-9 p-0'} rounded-none border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700`}
          aria-label={t('pdfViewer.zoomOut')}
        >
          <ZoomOut className={isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          onClick={handleZoomFit}
          disabled={!hasZoom}
          className={`${isMobile ? 'h-7 w-7 p-0' : 'h-9 w-9 p-0'} rounded-none border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700`}
          aria-label={t('pdfViewer.zoomFit')}
        >
          <Maximize2 className={isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          onClick={handleZoomIn}
          disabled={!hasZoom}
          className={`${isMobile ? 'h-7 w-7 p-0' : 'h-9 w-9 p-0'} rounded-none border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700`}
          aria-label={t('pdfViewer.zoomIn')}
        >
          <ZoomIn className={isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </Button>
      </ButtonGroup>

      {/* Spread Controls */}
      <ButtonGroup className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 overflow-hidden">
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          onClick={() => handleSpreadChange('none')}
          className={`${isMobile ? 'h-7 px-1.5 text-[10px]' : 'h-9 px-2 text-xs'} rounded-none border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
            spreadMode === 'none' ? 'bg-zinc-200 dark:bg-zinc-700' : ''
          }`}
          aria-label={t('pdfViewer.spreadNone')}
        >
          {t('pdfViewer.spreadNone')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          onClick={() => handleSpreadChange('odd')}
          className={`${isMobile ? 'h-7 px-1.5 text-[10px]' : 'h-9 px-2 text-xs'} rounded-none border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
            spreadMode === 'odd' ? 'bg-zinc-200 dark:bg-zinc-700' : ''
          }`}
          aria-label={t('pdfViewer.spreadOdd')}
        >
          {t('pdfViewer.spreadOdd')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          onClick={() => handleSpreadChange('even')}
          className={`${isMobile ? 'h-7 px-1.5 text-[10px]' : 'h-9 px-2 text-xs'} rounded-none border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
            spreadMode === 'even' ? 'bg-zinc-200 dark:bg-zinc-700' : ''
          }`}
          aria-label={t('pdfViewer.spreadEven')}
        >
          {t('pdfViewer.spreadEven')}
        </Button>
      </ButtonGroup>

      {/* Action Buttons */}
      <ButtonGroup className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 overflow-hidden">
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          onClick={handleCopyText}
          disabled={!hasSelection}
          className={`${isMobile ? 'h-7 w-7 p-0' : 'h-9 w-9 p-0'} rounded-none border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700`}
          aria-label={t('pdfViewer.copyText')}
        >
          <Copy className={isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          onClick={handlePrint}
          disabled={!hasPrint}
          className={`${isMobile ? 'h-7 w-7 p-0' : 'h-9 w-9 p-0'} rounded-none border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700`}
          aria-label={t('pdfViewer.print')}
        >
          <Printer className={isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size={isMobile ? "sm" : "sm"}
          onClick={handleExportPdf}
          disabled={!hasExport}
          className={`${isMobile ? 'h-7 w-7 p-0' : 'h-9 w-9 p-0'} rounded-none border-0 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700`}
          aria-label={t('pdfViewer.export')}
        >
          <Download className={isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </Button>
      </ButtonGroup>

      {/* Sidebar Toggle (desktop only) */}
      {!isMobile && (
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 p-0 text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? t('pdfViewer.showThumbnails') : t('pdfViewer.hideThumbnails')}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      )}

      {/* Close Button (desktop only - mobile has it in header) */}
      {onClose && !isMobile && (
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800/50 p-0 text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-red-50 dark:hover:bg-red-600/20 hover:border-red-300 dark:hover:border-red-600/50 hover:text-red-600 dark:hover:text-red-400"
          onClick={onClose}
          aria-label={t('pdfViewer.closeFullscreen')}
        >
          <X className="h-4 w-4" />
        </button>
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
  
  // Initialize the engine with the React hook
  const { engine, isLoading } = usePdfiumEngine();
  
  // Move useState to top level - hooks must be called unconditionally
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [zoomKey, setZoomKey] = useState(0);
  const [spreadKey, setSpreadKey] = useState(0);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if dark mode is active
  const isDark = mounted && (resolvedTheme === 'dark' || (theme === 'system' && resolvedTheme === 'dark'));

  // Track PDF loading progress using fetch
  useEffect(() => {
    if (!fileUrl) {
      setIsLoadingPdf(false);
      setLoadingProgress(0);
      return;
    }

    setIsLoadingPdf(true);
    setLoadingProgress(0);

    // Track download progress using fetch
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(fileUrl, { signal })
      .then((response) => {
        if (!response.body) {
          setIsLoadingPdf(false);
          return;
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;

        const reader = response.body.getReader();

        const pump = (): Promise<void> => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              setLoadingProgress(100);
              // Small delay to show 100% before hiding
              setTimeout(() => {
                setIsLoadingPdf(false);
              }, 300);
              return;
            }

            loaded += value.length;
            if (total > 0) {
              const progress = Math.min((loaded / total) * 100, 95); // Cap at 95% until done
              setLoadingProgress(progress);
            } else {
              // If content-length is unknown, show indeterminate progress
              setLoadingProgress((prev) => Math.min(prev + 5, 90));
            }

            return pump();
          });
        };

        return pump();
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('PDF loading error:', error);
          setIsLoadingPdf(false);
          setLoadingProgress(0);
        }
      });

    return () => {
      controller.abort();
    };
  }, [fileUrl]);

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
      <div className="relative flex h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        {/* Loading Progress Overlay */}
        {isLoadingPdf && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm">
            <div className="w-full max-w-md px-6">
              <div className="mb-3 flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
                <span className="font-medium">{t('pdfViewer.loadingPdfViewer')}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
        <EmbedPDF engine={engine} plugins={plugins}>
          {/* Top Header Bar */}
          <div className="relative flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 px-4 py-3 backdrop-blur-sm">
            {/* Left side - Title and course code */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {courseCode && (
                <div className="shrink-0 rounded bg-zinc-200 dark:bg-zinc-800 px-2 py-1">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {courseCode}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {title ?? 'PDF Document'}
                </h2>
              </div>
            </div>

            {/* Center - Toolbar controls (desktop only) */}
            {!isMobile && (
              <div className="absolute left-1/2 -translate-x-1/2">
                <PdfToolbar
                  onClose={onClose}
                  onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  isSidebarCollapsed={isSidebarCollapsed}
                  title={title}
                  isMobile={false}
                />
              </div>
            )}

            {/* Right side - Language, Theme switchers, and Mobile controls */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
              {isMobile && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-0 text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    aria-label="Toggle bottom sheet"
                  >
                    {isMobileSidebarOpen ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <PanelRightOpen className="h-4 w-4" />
                    )}
                  </button>
                  {onClose && (
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-0 text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-red-50 dark:hover:bg-red-600/20 hover:border-red-300 dark:hover:border-red-600/50 hover:text-red-600 dark:hover:text-red-400"
                      onClick={onClose}
                      aria-label={t('pdfViewer.closeFullscreen')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile Bottom Sheet */}
          <AnimatePresence>
            {isMobile && isMobileSidebarOpen && (
              <div className="absolute inset-0 z-40 flex flex-col">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 bg-black/50"
                  onClick={() => setIsMobileSidebarOpen(false)}
                />
                {/* Bottom Sheet */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="bg-white dark:bg-zinc-900 rounded-t-xl border-t border-zinc-200 dark:border-zinc-800 flex flex-col h-[40vh]"
                >
                  {/* Drag Handle */}
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  </div>
                  
                  {/* Sheet Header */}
                  <div className="border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 flex items-center justify-between shrink-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {title ?? t('pdfViewer.pages')}
                      </h3>
                      {title && (
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {t('pdfViewer.pages')}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0 ml-2"
                      aria-label="Close sidebar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Toolbar in mobile bottom sheet */}
                  <div className="border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 shrink-0">
                    <PdfToolbar
                      onClose={onClose}
                      onToggleSidebar={() => {}}
                      isSidebarCollapsed={false}
                      title={title}
                      isMobile={true}
                      onZoomChange={() => setZoomKey((prev) => prev + 1)}
                      onSpreadChange={() => setSpreadKey((prev) => prev + 1)}
                    />
                  </div>
                  
                  {/* Thumbnails in mobile bottom sheet */}
                  <div className="flex-1 min-h-0 w-full">
                    <div className="h-full w-full overflow-x-auto overflow-y-hidden">
                      <ThumbnailSidebar
                        isCollapsed={false}
                        onToggle={() => {}}
                        isMobile={true}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Thumbnail Sidebar (desktop only) */}
            {!isMobile && (
              <ThumbnailSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                isMobile={false}
              />
            )}

            {/* Main PDF Viewport */}
            <div className="flex-1 min-w-0 bg-zinc-50 dark:bg-zinc-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`viewport-overlay-${zoomKey}-${spreadKey}`}
                  initial={{ opacity: 0.7, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.7, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="h-full w-full"
                >
                  <Viewport
                    style={{
                      backgroundColor: isDark ? '#09090b' : '#f4f4f5',
                      height: '100%',
                    }}
                  >
                    <Scroller
                      renderPage={({ width, height, pageIndex, scale, rotation }) => (
                        <PagePointerProvider
                          pageIndex={pageIndex}
                          scale={scale}
                          rotation={rotation}
                          pageWidth={width}
                          pageHeight={height}
                        >
                          <motion.div
                            key={`page-overlay-${pageIndex}-${spreadKey}`}
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            style={{
                              width,
                              height,
                              position: 'relative',
                              display: 'flex',
                              justifyContent: 'center',
                              padding: '2rem 0',
                            }}
                          >
                            {/* Low-resolution base layer for immediate feedback */}
                            <RenderLayer pageIndex={pageIndex} scale={0.5} />
                            {/* High-resolution tile layer on top */}
                            <TilingLayer pageIndex={pageIndex} scale={scale} />
                            {/* Selection layer for text selection */}
                            <SelectionLayer pageIndex={pageIndex} scale={scale} />
                          </motion.div>
                        </PagePointerProvider>
                      )}
                    />
                  </Viewport>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </EmbedPDF>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
      {/* Loading Progress Overlay */}
      {isLoadingPdf && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-lg bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm">
          <div className="w-full max-w-xs px-4">
            <div className="mb-3 flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
              <span className="font-medium">{t('pdfViewer.loadingPdfViewer')}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {Math.round(loadingProgress)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {title ?? t('common.loading')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showPreviewButton && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openInPreviewPage}
              className="flex items-center gap-1.5"
            >
              <span>{t('pdfViewer.openInPreview')}</span>
              <span className="text-xs">⤢</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <EmbedPDF engine={engine} plugins={plugins}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`viewport-default-${zoomKey}-${spreadKey}`}
              initial={{ opacity: 0.7, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.7, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full w-full"
            >
              <Viewport
                style={{
                  backgroundColor: isDark ? '#09090b' : '#f4f4f5',
                  height: '100%',
                }}
              >
                <Scroller
                  renderPage={({ width, height, pageIndex, scale, rotation }) => (
                    <PagePointerProvider
                      pageIndex={pageIndex}
              scale={scale}
                      rotation={rotation}
                      pageWidth={width}
                      pageHeight={height}
                    >
                      <motion.div
                        key={`page-default-${pageIndex}-${spreadKey}`}
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{
                          width,
                          height,
                          position: 'relative',
                          display: 'flex',
                          justifyContent: 'center',
                          padding: '0.75rem 0',
                        }}
                      >
                        {/* Low-resolution base layer for immediate feedback */}
                        <RenderLayer pageIndex={pageIndex} scale={0.5} />
                        {/* High-resolution tile layer on top */}
                        <TilingLayer pageIndex={pageIndex} scale={scale} />
                        {/* Selection layer for text selection */}
                        <SelectionLayer pageIndex={pageIndex} scale={scale} />
                      </motion.div>
                    </PagePointerProvider>
                  )}
                />
              </Viewport>
            </motion.div>
          </AnimatePresence>
        </EmbedPDF>
      </div>
    </div>
  );
}
