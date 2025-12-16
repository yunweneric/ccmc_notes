'use client';

import { Calendar, CalendarDays, Grid3x3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { cn } from '@/lib/utils';
import type { CalendarView } from './calendar_utils';

interface CalendarViewSwitcherProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  showLabels?: boolean;
}

export function CalendarViewSwitcher({ view, onViewChange, showLabels = false }: CalendarViewSwitcherProps) {
  const views: { value: CalendarView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'year', label: 'Year', icon: Grid3x3 },
    { value: 'month', label: 'Month', icon: Calendar },
    { value: 'week', label: 'Week', icon: CalendarDays },
    { value: 'day', label: 'Day', icon: List },
  ];

  return (
    <ButtonGroup orientation="horizontal" className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {views.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewChange(value)}
          className={cn(
            'h-8 text-xs font-medium transition-colors border-0',
            showLabels ? 'px-3' : 'px-1.5 sm:px-3',
            view === value
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 z-10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 bg-transparent'
          )}
          aria-label={label}
        >
          <Icon className={cn('h-3.5 w-3.5', (showLabels ? 'mr-1.5' : 'sm:mr-1.5'))} />
          {showLabels ? <span>{label}</span> : <span className="hidden sm:inline">{label}</span>}
        </Button>
      ))}
    </ButtonGroup>
  );
}

