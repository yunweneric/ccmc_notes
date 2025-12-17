import type { CourseGroup } from '../interfaces/course';

export class CourseService {
  async list(): Promise<{ data: CourseGroup[]; error: Error | null }> {
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) {
        return {
          data: [],
          error: new Error(`Failed to load courses (${res.status})`),
        };
      }
      const json = (await res.json()) as CourseGroup[];
      return { data: json, error: null };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async create(courseGroup: CourseGroup): Promise<{ data: CourseGroup | null; error: Error | null }> {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseGroup),
      });
      if (!res.ok) {
        const error = await res.json();
        return {
          data: null,
          error: new Error(error.message || `Failed to create course (${res.status})`),
        };
      }
      const data = (await res.json()) as CourseGroup;
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async update(id: string, courseGroup: Partial<CourseGroup>): Promise<{ data: CourseGroup | null; error: Error | null }> {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseGroup),
      });
      if (!res.ok) {
        const error = await res.json();
        return {
          data: null,
          error: new Error(error.message || `Failed to update course (${res.status})`),
        };
      }
      const data = (await res.json()) as CourseGroup;
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        return {
          error: new Error(error.message || `Failed to delete course (${res.status})`),
        };
      }
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }
}

export const courseService = new CourseService();

