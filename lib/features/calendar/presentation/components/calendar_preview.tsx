'use client';

import { useState, useCallback } from 'react';
import { useCalendar } from '../../hooks';
import { CalendarNavigation } from './calendar_navigation';
import { CalendarMonthView } from './calendar_month_view';
import { CalendarWeekView } from './calendar_week_view';
import { CalendarDayView } from './calendar_day_view';
import { CalendarYearView } from './calendar_year_view';
import { TimetableModal } from './timetable_modal';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import type { CalendarView } from './calendar_utils';
import type { ClassSchedule, CreateClassSchedule, UpdateClassSchedule } from '../../data/interfaces';
import {
  getWeekStart,
  getMonthStart,
  getYearStart,
} from './calendar_utils';

export function CalendarPreview() {
  const { schedules, isLoading, error, createSchedule, updateSchedule, deleteSchedule, refetch } = useCalendar();
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handlePrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (view) {
        case 'day':
          newDate.setDate(newDate.getDate() - 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case 'year':
          newDate.setFullYear(newDate.getFullYear() - 1);
          break;
      }
      return newDate;
    });
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (view) {
        case 'day':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case 'year':
          newDate.setFullYear(newDate.getFullYear() + 1);
          break;
      }
      return newDate;
    });
  }, [view]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleViewChange = useCallback((newView: CalendarView) => {
    setView(newView);
    // Adjust currentDate to match the view's start point
    const today = new Date();
    switch (newView) {
      case 'day':
        setCurrentDate(today);
        break;
      case 'week':
        setCurrentDate(getWeekStart(today));
        break;
      case 'month':
        setCurrentDate(getMonthStart(today));
        break;
      case 'year':
        setCurrentDate(getYearStart(today));
        break;
    }
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setView('day');
  }, []);

  const handleMonthClick = useCallback((date: Date) => {
    setCurrentDate(date);
    setView('month');
  }, []);

  const handleCellClick = useCallback((date: Date, time?: string) => {
    setSelectedSchedule(null);
    setSelectedDate(date);
    setSelectedTime(time || null);
    setModalOpen(true);
  }, []);

  const handleScheduleClick = useCallback((schedule: ClassSchedule) => {
    setSelectedSchedule(schedule);
    setSelectedDate(null);
    setSelectedTime(null);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(async (data: CreateClassSchedule | UpdateClassSchedule) => {
    if ('id' in data) {
      await updateSchedule(data);
    } else {
      await createSchedule(data);
    }
    await refetch();
  }, [createSchedule, updateSchedule, refetch]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteSchedule(id);
    await refetch();
  }, [deleteSchedule, refetch]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Error loading calendar
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <CalendarNavigation
        view={view}
        currentDate={currentDate}
        onViewChange={handleViewChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />
      <div className="flex-1 overflow-hidden">
        {view === 'month' && (
          <CalendarMonthView
            currentDate={currentDate}
            schedules={schedules}
            onDayClick={handleDayClick}
            onCellClick={handleCellClick}
            onScheduleClick={handleScheduleClick}
          />
        )}
        {view === 'week' && (
          <CalendarWeekView
            currentDate={currentDate}
            schedules={schedules}
            onCellClick={handleCellClick}
            onScheduleClick={handleScheduleClick}
          />
        )}
        {view === 'day' && (
          <CalendarDayView
            currentDate={currentDate}
            schedules={schedules}
            onCellClick={handleCellClick}
            onScheduleClick={handleScheduleClick}
          />
        )}
        {view === 'year' && (
          <CalendarYearView
            currentDate={currentDate}
            schedules={schedules}
            onMonthClick={handleMonthClick}
          />
        )}
      </div>

      <TimetableModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        selectedDate={selectedDate || undefined}
        selectedTime={selectedTime || undefined}
        schedule={selectedSchedule || undefined}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}

