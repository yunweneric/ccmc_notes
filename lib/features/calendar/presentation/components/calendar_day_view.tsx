'use client';

import { useMemo, useState, useEffect } from 'react';
import type { ClassSchedule } from '../../data/interfaces';
import { getSchedulesForDay, calculateBlockPosition, isToday, formatTime } from './calendar_utils';
import { CalendarClassBlock } from './calendar_class_block';
import { CalendarMiniCalendar } from './calendar_mini_calendar';
import { CalendarEventsList } from './calendar_events_list';

interface CalendarDayViewProps {
  currentDate: Date;
  schedules: ClassSchedule[];
  onCellClick?: (date: Date, time: string) => void;
  onScheduleClick?: (schedule: ClassSchedule) => void;
  onDateSelect?: (date: Date) => void;
}

const HOUR_HEIGHT = 60; // 60px per hour
const START_HOUR = 0; // 12 AM (midnight)
const END_HOUR = 23; // 11 PM
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

export function CalendarDayView({
  currentDate,
  schedules,
  onCellClick,
  onScheduleClick,
  onDateSelect,
}: CalendarDayViewProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Sync selectedDate with currentDate when it changes (from navigation)
  useEffect(() => {
    setSelectedDate(currentDate);
  }, [currentDate]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const daySchedules = useMemo(
    () => getSchedulesForDay(schedules, selectedDate),
    [schedules, selectedDate]
  );
  const isTodayDay = isToday(selectedDate);

  // Calculate current time position
  const getCurrentTimePosition = (): number | null => {
    if (!isTodayDay) return null;
    
    const now = currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    return (totalMinutes / 60) * HOUR_HEIGHT;
  };

  const currentTimePosition = getCurrentTimePosition();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleEventClick = (schedule: ClassSchedule) => {
    onScheduleClick?.(schedule);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main day view */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className={`border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4 shrink-0 ${
          isTodayDay ? 'bg-blue-50 dark:bg-blue-950/30' : ''
        }`}>
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}{' '}
            {selectedDate.getDate().toString().padStart(2, '0')}
          </div>
        </div>

        {/* Time slots and schedule */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            {/* Time column */}
            <div className="w-20 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-zinc-200 dark:border-zinc-800 flex items-center"
                  style={{ height: HOUR_HEIGHT }}
                >
                  <div className="px-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule column */}
            <div className={`flex-1 relative ${
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
                    onClick={() => onCellClick?.(selectedDate, timeString)}
                  />
                );
              })}

              {/* Current time indicator */}
              {currentTimePosition !== null && (
                <div
                  className="absolute left-0 right-0 z-10 pointer-events-none"
                  style={{ top: `${currentTimePosition}px` }}
                >
                  {/* Line */}
                  <div className="h-px bg-red-500 dark:bg-red-400" />
                  {/* Circle indicator */}
                  <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-red-500 dark:bg-red-400 border-2 border-white dark:border-zinc-900" />
                </div>
              )}

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

      {/* Sidebar */}
      <div className="hidden md:block w-80 shrink-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto">
        <CalendarMiniCalendar
          currentDate={currentDate}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          schedules={schedules}
        />
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          <CalendarEventsList
            selectedDate={selectedDate}
            schedules={schedules}
            onEventClick={handleEventClick}
          />
        </div>
      </div>
    </div>
  );
}

