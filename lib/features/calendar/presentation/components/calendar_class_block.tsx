'use client';

import type { ClassSchedule } from '../../data/interfaces';
import { formatTime, getCourseColor } from './calendar_utils';

interface CalendarClassBlockProps {
  schedule: ClassSchedule;
  style?: React.CSSProperties;
  className?: string;
  onClick?: (schedule: ClassSchedule) => void;
}

export function CalendarClassBlock({ schedule, style, className, onClick }: CalendarClassBlockProps) {
  const colors = getCourseColor(schedule.courseCode, schedule.courseName);

  return (
    <div
      className={`absolute left-0 right-0 mx-0.5 ${colors.bg} px-1.5 py-1 text-xs cursor-pointer hover:opacity-90 transition-opacity ${
        className || ''
      }`}
      style={{
        ...style,
        borderLeft: `3px solid ${colors.border}`,
      }}
      onClick={() => onClick?.(schedule)}
    >
      <div className={`font-medium ${colors.text} truncate text-[11px] leading-tight`}>
        {schedule.courseName}
      </div>
      <div className={`${colors.textSecondary} text-[10px] truncate leading-tight`}>
        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
      </div>
      {schedule.location && (
        <div className={`${colors.textTertiary} text-[10px] truncate leading-tight`}>
          {schedule.location}
        </div>
      )}
    </div>
  );
}

