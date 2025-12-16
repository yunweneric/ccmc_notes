'use client';

import { cn } from '@/lib/utils';
import { isToday } from './calendar_utils';
import type { ClassSchedule } from '../../data/interfaces';

interface CalendarDayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  schedules: ClassSchedule[];
  onClick?: () => void;
  onScheduleClick?: (schedule: ClassSchedule) => void;
}

export function CalendarDayCell({
  date,
  isCurrentMonth,
  schedules,
  onClick,
  onScheduleClick,
}: CalendarDayCellProps) {
  const today = isToday(date);
  const dayNumber = date.getDate();
  const scheduleCount = schedules.length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex h-20 flex-col items-start justify-start border border-zinc-200 dark:border-zinc-800 p-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
        !isCurrentMonth && 'bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600',
        today && 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
      )}
    >
      <span
        className={cn(
          'text-sm font-medium',
          today && 'text-blue-600 dark:text-blue-400',
          !isCurrentMonth && 'text-zinc-400 dark:text-zinc-600'
        )}
      >
        {dayNumber}
      </span>
      {scheduleCount > 0 && (
        <div className="mt-1 flex flex-wrap gap-0.5">
          {schedules.slice(0, 3).map((schedule) => (
            <div
              key={schedule.id}
              className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-300 transition-colors"
              title={`${schedule.courseName} - ${schedule.startTime}`}
              onClick={(e) => {
                e.stopPropagation();
                onScheduleClick?.(schedule);
              }}
            />
          ))}
          {scheduleCount > 3 && (
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              +{scheduleCount - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

