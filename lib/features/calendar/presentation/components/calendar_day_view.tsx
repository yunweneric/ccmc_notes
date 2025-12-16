'use client';

import { useMemo } from 'react';
import type { ClassSchedule } from '../../data/interfaces';
import { getSchedulesForDay, calculateBlockPosition, isToday, formatTime } from './calendar_utils';
import { CalendarClassBlock } from './calendar_class_block';

interface CalendarDayViewProps {
  currentDate: Date;
  schedules: ClassSchedule[];
  onCellClick?: (date: Date, time: string) => void;
  onScheduleClick?: (schedule: ClassSchedule) => void;
}

const HOUR_HEIGHT = 60; // 60px per hour
const START_HOUR = 7; // 7 AM
const END_HOUR = 22; // 10 PM
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export function CalendarDayView({ currentDate, schedules, onCellClick, onScheduleClick }: CalendarDayViewProps) {
  const daySchedules = useMemo(() => getSchedulesForDay(schedules, currentDate), [schedules, currentDate]);
  const isTodayDay = isToday(currentDate);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className={`border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 ${
        isTodayDay ? 'bg-blue-50 dark:bg-blue-950/30' : ''
      }`}>
        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className={`text-2xl font-semibold ${
          isTodayDay ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'
        }`}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Time slots and schedule */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2">
          {/* Time column */}
          <div className="border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b border-zinc-200 dark:border-zinc-800"
                style={{ height: HOUR_HEIGHT }}
              >
                <div className="px-4 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
                </div>
              </div>
            ))}
          </div>

          {/* Schedule column */}
          <div className={`relative ${
            isTodayDay ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
          }`}>
            {/* Time slot grid */}
            {HOURS.map((hour) => {
              const timeString = `${hour.toString().padStart(2, '0')}:00`;
              return (
                <div
                  key={hour}
                  className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  style={{ height: HOUR_HEIGHT }}
                  onClick={() => onCellClick?.(currentDate, timeString)}
                />
              );
            })}

            {/* Class blocks */}
            {daySchedules.map((schedule) => {
              const { top, height } = calculateBlockPosition(
                schedule.startTime,
                schedule.endTime,
                HOUR_HEIGHT
              );

              return (
                <CalendarClassBlock
                  key={schedule.id}
                  schedule={schedule}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                  }}
                  className="mx-2"
                  onClick={onScheduleClick}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

