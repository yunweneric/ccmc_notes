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

export async function GET() {
  try {
    const courses = getCourses();
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const courseGroup: CourseGroup = await request.json();
    
    // Validate required fields
    if (!courseGroup.level || !courseGroup.semester || !courseGroup.course_code || !courseGroup.course) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const courses = getCourses();
    const id = generateId(courseGroup);
    
    // Check if course already exists
    const existingIndex = courses.findIndex(
      (c) => generateId(c) === id
    );
    
    if (existingIndex !== -1) {
      return NextResponse.json(
        { error: 'Course already exists' },
        { status: 409 }
      );
    }

    // Ensure notes array exists
    if (!courseGroup.notes) {
      courseGroup.notes = [];
    }

    courses.push(courseGroup);
    saveCourses(courses);

    return NextResponse.json(courseGroup, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

