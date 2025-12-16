'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { GithubButton } from '@/components/github/GithubButton';
import { CalendarViewSwitcher } from './calendar_view_switcher';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { CalendarView } from './calendar_utils';
import { formatDateRange, getWeekStart, getMonthStart, getYearStart } from './calendar_utils';

interface CalendarNavigationProps {
  view: CalendarView;
  currentDate: Date;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarNavigation({
  view,
  currentDate,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarNavigationProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const getDateRange = (isMobile = false): string => {
    switch (view) {
      case 'day': {
        if (isMobile) {
          return currentDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
        }
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
      case 'week': {
        const weekStart = getWeekStart(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (isMobile) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
        return formatDateRange(weekStart, weekEnd);
      }
      case 'month': {
        if (isMobile) {
          return currentDate.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          });
        }
        return currentDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });
      }
      case 'year': {
        return currentDate.getFullYear().toString();
      }
      default:
        return '';
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 sm:px-4 sm:py-3">
        {/* Top row: Navigation controls and date */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
            <Link href="/">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="h-8 w-8 p-0"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onNext}
                className="h-8 w-8 p-0"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-sm sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate min-w-0 ml-1 sm:ml-0">
              <span className="hidden sm:inline">{getDateRange(false)}</span>
              <span className="sm:hidden">{getDateRange(true)}</span>
            </h2>
          </div>
          {/* Desktop: Show all controls */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <CalendarViewSwitcher view={view} onViewChange={onViewChange} />
            <ThemeSwitcher />
            <LanguageSwitcher />
            <GithubButton />
          </div>
          {/* Mobile: Show menu button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 shrink-0 sm:hidden"
                aria-label="Menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Calendar Options</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                    View
                  </label>
                  <CalendarViewSwitcher 
                    view={view} 
                    showLabels={true}
                    onViewChange={(newView) => {
                      onViewChange(newView);
                      setSheetOpen(false);
                    }} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                    Theme
                  </label>
                  <ThemeSwitcher variant="buttons" showLabels={true} />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                    Language
                  </label>
                  <LanguageSwitcher variant="buttons" showLabels={true} />
                </div>
                <a
                  href="https://github.com/yunweneric/ccmc_notes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <GithubButton showStars={false} />
                  <span>View on GitHub</span>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}

