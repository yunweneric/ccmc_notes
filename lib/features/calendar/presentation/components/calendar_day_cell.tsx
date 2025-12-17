'use client';

import { cn } from '@/lib/utils';
import { isToday, getCourseColor, formatTime } from './calendar_utils';
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
  const visibleSchedules = schedules.slice(0, 4);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-start justify-start border border-zinc-200 dark:border-zinc-800 p-2 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 overflow-hidden',
        !isCurrentMonth && 'bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600',
        today && 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
      )}
    >
      <span
        className={cn(
          'text-sm font-medium mb-1',
          today && 'text-blue-600 dark:text-blue-400',
          !isCurrentMonth && 'text-zinc-400 dark:text-zinc-600'
        )}
      >
        {dayNumber}
      </span>
      
      {/* Desktop: Show schedule tiles */}
      <div className="hidden md:flex flex-1 w-full space-y-0.5 min-h-0 overflow-hidden">
        {visibleSchedules.map((schedule) => {
          const colors = getCourseColor(schedule.courseCode, schedule.courseName);
          return (
            <div
              key={schedule.id}
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded cursor-pointer truncate',
                colors.bg
              )}
              style={{ borderLeft: `2px solid ${colors.border}` }}
              onClick={(e) => {
                e.stopPropagation();
                onScheduleClick?.(schedule);
              }}
              title={`${schedule.courseName} - ${formatTime(schedule.startTime)}`}
            >
              <div className={`${colors.text} font-medium truncate`}>
                {schedule.courseName}
              </div>
              <div className={`${colors.textSecondary} truncate`}>
                {formatTime(schedule.startTime)}
              </div>
            </div>
          );
        })}
        {scheduleCount > 4 && (
          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5">
            +{scheduleCount - 4} more
          </div>
        )}
      </div>

      {/* Mobile: Show colored dots */}
      <div className="flex md:hidden flex-1 w-full items-end justify-center pb-1">
        {schedules.length > 0 && (
          <div className="flex items-center gap-0.5 flex-wrap justify-center max-w-full">
            {schedules.slice(0, 6).map((schedule) => {
              const colors = getCourseColor(schedule.courseCode, schedule.courseName);
              return (
                <div
                  key={schedule.id}
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors.border }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onScheduleClick?.(schedule);
                  }}
                  title={`${schedule.courseName} - ${formatTime(schedule.startTime)}`}
                />
              );
            })}
            {scheduleCount > 6 && (
              <span className="text-[8px] text-zinc-500 dark:text-zinc-400 ml-0.5">
                +{scheduleCount - 6}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

