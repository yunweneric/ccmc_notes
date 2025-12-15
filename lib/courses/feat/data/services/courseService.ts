import type { CourseGroup } from '../interfaces/course';

export async function fetchCourseNotes(): Promise<CourseGroup[]> {
  const res = await fetch('/notes.json');
  if (!res.ok) {
    throw new Error(`Failed to load notes.json (${res.status})`);
  }
  const json = (await res.json()) as CourseGroup[];
  return json;
}


