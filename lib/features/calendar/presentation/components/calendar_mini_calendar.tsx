'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getMonthDays, isToday, isSameDay } from './calendar_utils';
import type { ClassSchedule } from '../../data/interfaces';

interface CalendarMiniCalendarProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  schedules: ClassSchedule[];
}

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function CalendarMiniCalendar({
  currentDate,
  selectedDate,
  onDateSelect,
  schedules,
}: CalendarMiniCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

  const monthDays = useMemo(() => getMonthDays(viewDate), [viewDate]);
  const monthName = MONTH_NAMES[viewDate.getMonth()];
  const year = viewDate.getFullYear();

  const hasScheduleOnDate = (date: Date): boolean => {
    return schedules.some(schedule => {
      const scheduleDay = parseInt(schedule.day) || (schedule.day.toLowerCase() === 'monday' ? 1 :
        schedule.day.toLowerCase() === 'tuesday' ? 2 :
        schedule.day.toLowerCase() === 'wednesday' ? 3 :
        schedule.day.toLowerCase() === 'thursday' ? 4 :
        schedule.day.toLowerCase() === 'friday' ? 5 :
        schedule.day.toLowerCase() === 'saturday' ? 6 : 0);
      return date.getDay() === scheduleDay;
    });
  };

  const handlePreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  return (
    <div className="p-4">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePreviousMonth}
          className="h-6 w-6 p-0"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {monthName} {year}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="h-6 w-6 p-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {monthDays.map(({ date, isCurrentMonth }, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);
          const hasSchedule = hasScheduleOnDate(date);

          return (
            <button
              key={index}
              type="button"
              onClick={() => onDateSelect(date)}
              className={cn(
                'h-7 w-7 rounded-full text-xs transition-colors',
                !isCurrentMonth && 'text-zinc-300 dark:text-zinc-700',
                isSelected && 'bg-blue-500 text-white dark:bg-blue-400',
                !isSelected && isTodayDate && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                !isSelected && !isTodayDate && isCurrentMonth && 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
                hasSchedule && !isSelected && !isTodayDate && 'bg-zinc-100 dark:bg-zinc-800/50'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

