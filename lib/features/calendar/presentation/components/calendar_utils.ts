import type { ClassSchedule } from '../../data/interfaces';

export type CalendarView = 'month' | 'week' | 'day' | 'year';

/**
 * Get the Monday of the week for a given date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the first day of the month for a given date
 */
export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get the first day of the year for a given date
 */
export function getYearStart(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Convert time string "HH:MM" to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to "HH:MM" string
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Format date range for display
 */
export function formatDateRange(start: Date, end: Date, locale: string = 'en-US'): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  
  if (start.getTime() === end.getTime()) {
    return start.toLocaleDateString(locale, options);
  }
  
  return `${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}`;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Get day name from day string or number
 */
export function getDayName(day: string | number): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (typeof day === 'number') {
    return dayNames[day];
  }
  
  // Try to match day name
  const lowerDay = day.toLowerCase();
  const index = dayNames.findIndex(d => d.toLowerCase().startsWith(lowerDay));
  if (index !== -1) return dayNames[index];
  
  // Try to parse as number string
  const num = parseInt(day, 10);
  if (!isNaN(num) && num >= 0 && num <= 6) {
    return dayNames[num];
  }
  
  return day; // Return as-is if can't parse
}

/**
 * Get day number (0-6) from day string or number
 */
export function getDayNumber(day: string | number): number {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (typeof day === 'number') {
    return day;
  }
  
  const lowerDay = day.toLowerCase();
  const index = dayNames.findIndex(d => d.toLowerCase().startsWith(lowerDay));
  if (index !== -1) return index;
  
  const num = parseInt(day, 10);
  if (!isNaN(num) && num >= 0 && num <= 6) {
    return num;
  }
  
  return 0; // Default to Sunday
}

/**
 * Check if a schedule matches a specific date
 */
export function scheduleMatchesDate(schedule: ClassSchedule, date: Date): boolean {
  const scheduleDay = getDayNumber(schedule.day);
  const dateDay = date.getDay();
  return scheduleDay === dateDay;
}

/**
 * Get schedules for a specific day
 */
export function getSchedulesForDay(schedules: ClassSchedule[], date: Date): ClassSchedule[] {
  return schedules.filter(schedule => scheduleMatchesDate(schedule, date));
}

/**
 * Get schedules for a week (Monday to Sunday)
 */
export function getSchedulesForWeek(schedules: ClassSchedule[], weekStart: Date): ClassSchedule[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  // Get all days in the week
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    weekDays.push(day);
  }
  
  // Filter schedules that match any day in the week
  return schedules.filter(schedule => {
    return weekDays.some(day => scheduleMatchesDate(schedule, day));
  });
}

/**
 * Get schedules for a month
 */
export function getSchedulesForMonth(schedules: ClassSchedule[], monthStart: Date): ClassSchedule[] {
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  
  // Get all days in the month
  const monthDays: Date[] = [];
  for (let day = 1; day <= monthEnd.getDate(); day++) {
    monthDays.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), day));
  }
  
  // Filter schedules that match any day in the month
  return schedules.filter(schedule => {
    return monthDays.some(day => scheduleMatchesDate(schedule, day));
  });
}

/**
 * Calculate block position and height for a class schedule
 */
export function calculateBlockPosition(
  startTime: string,
  endTime: string,
  hourHeight: number
): { top: number; height: number } {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const duration = endMinutes - startMinutes;
  
  const top = (startMinutes / 60) * hourHeight;
  const height = (duration / 60) * hourHeight;
  
  return { top, height };
}

/**
 * Get all days in a week starting from Monday
 */
export function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    days.push(day);
  }
  return days;
}

/**
 * Get all days in a month with padding for previous/next month
 */
export function getMonthDays(monthStart: Date): { date: Date; isCurrentMonth: boolean }[] {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  
  // Get first day of month and its day of week (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();
  const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday-based (0-6)
  
  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  
  // Add previous month days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  
  for (let i = mondayOffset - 1; i >= 0; i--) {
    days.push({
      date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }
  
  // Add current month days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
    });
  }
  
  // Add next month days to fill the grid (42 days total for 6 rows)
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    days.push({
      date: new Date(nextYear, nextMonth, day),
      isCurrentMonth: false,
    });
  }
  
  return days;
}

/**
 * Format time for display (e.g., "9:00 AM")
 */
export function formatTime(time: string, locale: string = 'en-US'): string {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0);
  
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Group schedules by day
 */
export function groupSchedulesByDay(schedules: ClassSchedule[]): Map<number, ClassSchedule[]> {
  const grouped = new Map<number, ClassSchedule[]>();
  
  schedules.forEach(schedule => {
    const dayNum = getDayNumber(schedule.day);
    if (!grouped.has(dayNum)) {
      grouped.set(dayNum, []);
    }
    grouped.get(dayNum)!.push(schedule);
  });
  
  return grouped;
}

/**
 * Group schedules by month
 */
export function groupSchedulesByMonth(schedules: ClassSchedule[]): Map<number, ClassSchedule[]> {
  const grouped = new Map<number, ClassSchedule[]>();
  
  // For now, we'll group by the day of week since we don't have date info
  // This will be improved when we add date tracking to schedules
  schedules.forEach(schedule => {
    const dayNum = getDayNumber(schedule.day);
    if (!grouped.has(dayNum)) {
      grouped.set(dayNum, []);
    }
    grouped.get(dayNum)!.push(schedule);
  });
  
  return grouped;
}

