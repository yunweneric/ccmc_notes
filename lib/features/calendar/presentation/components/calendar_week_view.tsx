'use client';

import { useMemo } from 'react';
import type { ClassSchedule } from '../../data/interfaces';
import { getWeekDays, getSchedulesForWeek, calculateBlockPosition, isToday, formatTime, getDayNumber } from './calendar_utils';
import { CalendarClassBlock } from './calendar_class_block';

interface CalendarWeekViewProps {
  currentDate: Date;
  schedules: ClassSchedule[];
}

const HOUR_HEIGHT = 60; // 60px per hour
const START_HOUR = 7; // 7 AM
const END_HOUR = 22; // 10 PM
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export function CalendarWeekView({ currentDate, schedules }: CalendarWeekViewProps) {
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [currentDate]);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const weekSchedules = useMemo(() => getSchedulesForWeek(schedules, weekStart), [schedules, weekStart]);

  const schedulesByDay = useMemo(() => {
    const grouped = new Map<number, ClassSchedule[]>();
    weekDays.forEach((day, index) => {
      const daySchedules = weekSchedules.filter(schedule => {
        const scheduleDay = getDayNumber(schedule.day);
        return day.getDay() === scheduleDay;
      });
      grouped.set(index, daySchedules);
    });
    return grouped;
  }, [weekDays, weekSchedules]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="border-r border-zinc-200 dark:border-zinc-800 p-2"></div>
        {weekDays.map((day, index) => {
          const isTodayDay = isToday(day);
          return (
            <div
              key={index}
              className={`border-r border-zinc-200 dark:border-zinc-800 p-2 text-center last:border-r-0 ${
                isTodayDay ? 'bg-blue-50 dark:bg-blue-950/30' : ''
              }`}
            >
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`text-lg font-semibold ${
                  isTodayDay
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time slots and schedule grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b border-zinc-200 dark:border-zinc-800"
                style={{ height: HOUR_HEIGHT }}
              >
                <div className="px-2 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
                </div>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const isTodayDay = isToday(day);
            const daySchedules = schedulesByDay.get(dayIndex) || [];

            return (
              <div
                key={dayIndex}
                className={`relative border-r border-zinc-200 dark:border-zinc-800 last:border-r-0 ${
                  isTodayDay ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                }`}
              >
                {/* Time slot grid */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-zinc-200 dark:border-zinc-800"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

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
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

