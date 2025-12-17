'use client';

import { useState, useEffect, useCallback } from 'react';
import { courseService } from '../data/services';
import type { CourseGroup } from '../data/interfaces/course';

export function useAdminCourses() {
  const [courses, setCourses] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await courseService.list();
    if (err) {
      setError(err);
      setCourses([]);
    } else {
      setCourses(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  const createCourse = useCallback(
    async (courseGroup: CourseGroup): Promise<CourseGroup | null> => {
      setError(null);
      const { data, error: err } = await courseService.create(courseGroup);
      if (err) {
        setError(err);
        return null;
      }
      if (data) {
        await fetchCourses();
        return data;
      }
      return null;
    },
    [fetchCourses]
  );

  const updateCourse = useCallback(
    async (id: string, courseGroup: Partial<CourseGroup>): Promise<CourseGroup | null> => {
      setError(null);
      const { data, error: err } = await courseService.update(id, courseGroup);
      if (err) {
        setError(err);
        return null;
      }
      if (data) {
        await fetchCourses();
        return data;
      }
      return null;
    },
    [fetchCourses]
  );

  const deleteCourse = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);
      const { error: err } = await courseService.delete(id);
      if (err) {
        setError(err);
        return false;
      }
      await fetchCourses();
      return true;
    },
    [fetchCourses]
  );

  return {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    refetch: fetchCourses,
  };
}

