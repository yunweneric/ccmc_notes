'use client';

import type { ClassSchedule } from '../../data/interfaces';
import { formatTime } from './calendar_utils';

interface CalendarClassBlockProps {
  schedule: ClassSchedule;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (schedule: ClassSchedule) => void;
}

export function CalendarClassBlock({ schedule, style, className, onClick }: CalendarClassBlockProps) {
  return (
    <div
      className={`absolute left-0 right-0 mx-1 rounded-md border-l-4 bg-blue-50 dark:bg-blue-950/30 p-1.5 text-xs shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        className || ''
      }`}
      style={{
        ...style,
        borderLeftColor: '#3b82f6', // blue-500
      }}
      onClick={() => onClick?.(schedule)}
    >
      <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
        {schedule.courseName}
      </div>
      <div className="text-blue-700 dark:text-blue-300 text-[10px] truncate">
        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
      </div>
      {schedule.location && (
        <div className="text-blue-600 dark:text-blue-400 text-[10px] truncate">
          {schedule.location}
        </div>
      )}
    </div>
  );
}

