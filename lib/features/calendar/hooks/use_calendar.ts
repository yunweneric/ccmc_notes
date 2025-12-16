'use client';

import { useState, useEffect, useCallback } from 'react';
import { calendarService } from '../data/services';
import type { ClassSchedule, CreateClassSchedule, UpdateClassSchedule } from '../data/interfaces';

export function useCalendar() {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await calendarService.list();
    if (err) {
      setError(err);
      setSchedules([]);
    } else {
      setSchedules(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchSchedules();
  }, [fetchSchedules]);

  const createSchedule = useCallback(
    async (input: CreateClassSchedule): Promise<ClassSchedule | null> => {
      const { data, error: err } = await calendarService.create(input);
      if (err) {
        setError(err);
        return null;
      }
      await fetchSchedules();
      return data;
    },
    [fetchSchedules]
  );

  const updateSchedule = useCallback(
    async (input: UpdateClassSchedule): Promise<ClassSchedule | null> => {
      const { data, error: err } = await calendarService.update(input);
      if (err) {
        setError(err);
        return null;
      }
      await fetchSchedules();
      return data;
    },
    [fetchSchedules]
  );

  const deleteSchedule = useCallback(
    async (id: string): Promise<boolean> => {
      const { error: err } = await calendarService.delete(id);
      if (err) {
        setError(err);
        return false;
      }
      await fetchSchedules();
      return true;
    },
    [fetchSchedules]
  );

  return {
    schedules,
    isLoading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    refetch: fetchSchedules,
  };
}

