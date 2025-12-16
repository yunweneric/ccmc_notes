'use client';

import { useMemo } from 'react';
import type { ClassSchedule } from '../../data/interfaces';
import { getSchedulesForDay, formatTime, getCourseColor } from './calendar_utils';

interface CalendarEventsListProps {
  selectedDate: Date;
  schedules: ClassSchedule[];
  onEventClick?: (schedule: ClassSchedule) => void;
}

export function CalendarEventsList({
  selectedDate,
  schedules,
  onEventClick,
}: CalendarEventsListProps) {
  const daySchedules = useMemo(
    () => getSchedulesForDay(schedules, selectedDate),
    [schedules, selectedDate]
  );

  return (
      <div className="px-4 pt-4 pb-4">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
        Events
      </h3>
      {daySchedules.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          No events scheduled
        </p>
      ) : (
        <ul className="space-y-2">
          {daySchedules.map((schedule) => {
            const colors = getCourseColor(schedule.courseCode, schedule.courseName);
            return (
              <li
                key={schedule.id}
                className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                onClick={() => onEventClick?.(schedule)}
              >
                <span
                  className="mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors.border }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{schedule.courseName}</div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-[10px]">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

