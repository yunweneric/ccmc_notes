'use client';

import { Calendar, CalendarDays, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CalendarView } from './calendar_utils';

interface CalendarViewSwitcherProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export function CalendarViewSwitcher({ view, onViewChange }: CalendarViewSwitcherProps) {
  const views: { value: CalendarView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'year', label: 'Year', icon: Grid3x3 },
    { value: 'month', label: 'Month', icon: Calendar },
    { value: 'week', label: 'Week', icon: CalendarDays },
    { value: 'day', label: 'Day', icon: List },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1">
      {views.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewChange(value)}
          className={cn(
            'h-8 px-3 text-xs font-medium transition-colors',
            view === value
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          )}
        >
          <Icon className="mr-1.5 h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}

