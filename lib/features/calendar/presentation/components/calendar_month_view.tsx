'use client';

import { useMemo } from 'react';
import type { ClassSchedule } from '../../data/interfaces';
import { getMonthDays, getSchedulesForMonth, isToday, getDayNumber } from './calendar_utils';
import { CalendarDayCell } from './calendar_day_cell';

interface CalendarMonthViewProps {
  currentDate: Date;
  schedules: ClassSchedule[];
  onDayClick?: (date: Date) => void;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarMonthView({
  currentDate,
  schedules,
  onDayClick,
}: CalendarMonthViewProps) {
  const monthStart = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  const monthSchedules = useMemo(() => getSchedulesForMonth(schedules, monthStart), [schedules, monthStart]);
  const monthDays = useMemo(() => getMonthDays(monthStart), [monthStart]);

  const schedulesByDate = useMemo(() => {
    const grouped = new Map<string, ClassSchedule[]>();
    monthDays.forEach(({ date }) => {
      const dateKey = date.toISOString().split('T')[0];
      const daySchedules = monthSchedules.filter(schedule => {
        const scheduleDay = getDayNumber(schedule.day);
        return date.getDay() === scheduleDay;
      });
      grouped.set(dateKey, daySchedules);
    });
    return grouped;
  }, [monthDays, monthSchedules]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Day names header */}
      <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {DAY_NAMES.map((dayName) => (
          <div
            key={dayName}
            className="border-r border-zinc-200 dark:border-zinc-800 p-2 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 last:border-r-0"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7">
          {monthDays.map(({ date, isCurrentMonth }, index) => {
            const dateKey = date.toISOString().split('T')[0];
            const daySchedules = schedulesByDate.get(dateKey) || [];

            return (
              <CalendarDayCell
                key={index}
                date={date}
                isCurrentMonth={isCurrentMonth}
                schedules={daySchedules}
                onClick={() => onDayClick?.(date)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

