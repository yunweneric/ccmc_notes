'use client';

import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarViewSwitcher } from './calendar_view_switcher';
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToday}
            className="h-8 px-2 sm:px-3 text-xs shrink-0"
          >
            <span className="hidden sm:inline">Today</span>
            <span className="sm:hidden">Now</span>
          </Button>
          <h2 className="text-sm sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate min-w-0">
            <span className="hidden sm:inline">{getDateRange(false)}</span>
            <span className="sm:hidden">{getDateRange(true)}</span>
          </h2>
        </div>
        <div className="shrink-0">
          <CalendarViewSwitcher view={view} onViewChange={onViewChange} />
        </div>
      </div>
    </div>
  );
}

