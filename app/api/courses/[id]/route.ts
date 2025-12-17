import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { CourseGroup } from '@/lib/features/courses/data/interfaces/course';

const NOTES_FILE_PATH = join(process.cwd(), 'public', 'notes.json');

function getCourses(): CourseGroup[] {
  try {
    const fileContent = readFileSync(NOTES_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent) as CourseGroup[];
  } catch (error) {
    console.error('Error reading notes.json:', error);
    return [];
  }
}

function saveCourses(courses: CourseGroup[]): void {
  try {
    writeFileSync(NOTES_FILE_PATH, JSON.stringify(courses, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing notes.json:', error);
    throw new Error('Failed to save courses');
  }
}

function generateId(courseGroup: CourseGroup): string {
  return `${courseGroup.level}-${courseGroup.semester}-${courseGroup.course_code}`;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const updates: Partial<CourseGroup> = await request.json();
    
    const courses = getCourses();
    const courseIndex = courses.findIndex((c) => generateId(c) === decodedId);
    
    if (courseIndex === -1) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // If updating level, semester, or course_code, we need to handle ID change
    const oldCourse = courses[courseIndex];
    const newCourse = {
      ...oldCourse,
      ...updates,
      // Preserve notes if not provided in update
      notes: updates.notes !== undefined ? updates.notes : oldCourse.notes,
    };
    
    // If the ID would change, check for conflicts
    const newId = generateId(newCourse);
    if (newId !== decodedId) {
      const existingIndex = courses.findIndex((c) => generateId(c) === newId);
      if (existingIndex !== -1 && existingIndex !== courseIndex) {
        return NextResponse.json(
          { error: 'A course with this combination already exists' },
          { status: 409 }
        );
      }
    }

    courses[courseIndex] = newCourse;
    saveCourses(courses);

    return NextResponse.json(courses[courseIndex]);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    
    const courses = getCourses();
    const courseIndex = courses.findIndex((c) => generateId(c) === decodedId);
    
    if (courseIndex === -1) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    courses.splice(courseIndex, 1);
    saveCourses(courses);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}

