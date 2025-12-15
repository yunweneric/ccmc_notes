import type { CourseGroup } from '../interfaces/course';

export async function fetchCourseNotes(): Promise<CourseGroup[]> {
  await new Promise((resolve) => setTimeout(resolve, 4000));
  // throw new Error(`Failed to load notes.json (4000ms delay)`);

  const res = await fetch('/notes.json');
  if (!res.ok) {
    throw new Error(`Failed to load notes.json (${res.status})`);
  }
  const json = (await res.json()) as CourseGroup[];
  return json;
}


