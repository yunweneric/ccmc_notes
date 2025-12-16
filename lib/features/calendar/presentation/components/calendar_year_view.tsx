'use client';

import { useMemo } from 'react';
import type { ClassSchedule } from '../../data/interfaces';
import { getMonthDays, getSchedulesForMonth, isToday, getDayNumber } from './calendar_utils';
import { cn } from '@/lib/utils';

interface CalendarYearViewProps {
  currentDate: Date;
  schedules: ClassSchedule[];
  onMonthClick?: (date: Date) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function CalendarYearView({
  currentDate,
  schedules,
  onMonthClick,
}: CalendarYearViewProps) {
  const year = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(year, i, 1);
      return {
        month: i,
        monthStart,
        name: MONTH_NAMES[i],
        days: getMonthDays(monthStart),
        schedules: getSchedulesForMonth(schedules, monthStart),
      };
    });
  }, [year, schedules]);

  const getScheduleCountForDate = (date: Date, monthSchedules: ClassSchedule[]): number => {
    return monthSchedules.filter(schedule => {
      const scheduleDay = getDayNumber(schedule.day);
      return date.getDay() === scheduleDay;
    }).length;
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map(({ month, monthStart, name, days, schedules: monthSchedules }) => {
          const isCurrentMonth = month === currentMonth;
          const totalSchedules = monthSchedules.length;

          return (
            <button
              key={month}
              type="button"
              onClick={() => onMonthClick?.(monthStart)}
              className={cn(
                'rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800',
                isCurrentMonth && 'ring-2 ring-blue-500 dark:ring-blue-400'
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <h3
                  className={cn(
                    'text-sm font-semibold',
                    isCurrentMonth
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-zinc-900 dark:text-zinc-100'
                  )}
                >
                  {name}
                </h3>
                {totalSchedules > 0 && (
                  <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                    {totalSchedules}
                  </span>
                )}
              </div>

              {/* Mini calendar grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {/* Day names */}
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div
                    key={idx}
                    className="p-1 text-center text-[10px] font-medium text-zinc-400 dark:text-zinc-600"
                  >
                    {day}
                  </div>
                ))}

                {/* Days */}
                {days.map(({ date, isCurrentMonth: isInMonth }, idx) => {
                  const scheduleCount = isInMonth
                    ? getScheduleCountForDate(date, monthSchedules)
                    : 0;
                  const isTodayDay = isToday(date);

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'relative flex h-6 items-center justify-center rounded text-[10px]',
                        !isInMonth && 'text-zinc-300 dark:text-zinc-700',
                        isTodayDay && 'bg-blue-500 text-white dark:bg-blue-400',
                        scheduleCount > 0 && !isTodayDay && 'bg-blue-100 dark:bg-blue-900/30'
                      )}
                    >
                      {date.getDate()}
                      {scheduleCount > 0 && !isTodayDay && (
                        <div className="absolute bottom-0.5 left-1/2 h-0.5 w-0.5 -translate-x-1/2 rounded-full bg-blue-500 dark:bg-blue-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

