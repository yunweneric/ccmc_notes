import type { CourseGroup } from '../interfaces/course';

export class CourseService {
  async list(): Promise<{ data: CourseGroup[]; error: Error | null }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      // throw new Error(`Failed to load notes.json (4000ms delay)`);

      const res = await fetch('/notes.json');
      if (!res.ok) {
        return {
          data: [],
          error: new Error(`Failed to load notes.json (${res.status})`),
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
}

export const courseService = new CourseService();

