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
  const getDateRange = (): string => {
    switch (view) {
      case 'day': {
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
        return formatDateRange(weekStart, weekEnd);
      }
      case 'month': {
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
    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-1">
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
          className="h-8 px-3 text-xs"
        >
          Today
        </Button>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {getDateRange()}
        </h2>
      </div>
      <CalendarViewSwitcher view={view} onViewChange={onViewChange} />
    </div>
  );
}

