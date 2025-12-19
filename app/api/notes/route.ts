import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { CourseGroup } from '@/lib/features/courses/data/interfaces/course';
import type { Note } from '@/lib/features/notes/data/interfaces/note';

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

function generateNoteId(courseId: string): string {
  return `${courseId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getAllNotes(courseId?: string): Note[] {
  const courses = getCourses();
  const allNotes: Note[] = [];

  for (const course of courses) {
    const courseIdForNote = `${course.level}-${course.semester}-${course.course_code}`;
    
    if (courseId && courseIdForNote !== courseId) {
      continue;
    }

    if (course.notes && Array.isArray(course.notes)) {
      for (const rawNote of course.notes) {
        // Convert RawNote to Note format
        const note: Note = {
          id: (rawNote as any).id || generateNoteId(courseIdForNote),
          title: rawNote.title,
          description: rawNote.description,
          lecturer_name: rawNote.lecturer_name,
          added_date: rawNote.added_date,
          updated_date: (rawNote as any).updated_date,
          created_by: (rawNote as any).created_by,
          tags: (rawNote as any).tags || [],
          file_url: rawNote.file_url,
          file_size: (rawNote as any).file_size,
          file_type: (rawNote as any).file_type,
          course_id: courseIdForNote,
        };
        allNotes.push(note);
      }
    }
  }

  return allNotes;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');
    
    const notes = getAllNotes(courseId || undefined);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const user = await getCurrentUser(request);
    // if (!user || user.role?.name !== Role.ADMIN) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const noteData: Omit<Note, 'id'> & { id?: string } = await request.json();
    
    // Validate required fields
    if (!noteData.course_id || !noteData.title || !noteData.description || !noteData.lecturer_name || !noteData.file_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const courses = getCourses();
    const courseIndex = courses.findIndex(
      (c) => `${c.level}-${c.semester}-${c.course_code}` === noteData.course_id
    );

    if (courseIndex === -1) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const course = courses[courseIndex];
    const noteId = noteData.id || generateNoteId(noteData.course_id);
    const currentDate = new Date().toISOString().split('T')[0];

    // Create new note in RawNote format for storage
    const newRawNote = {
      title: noteData.title,
      description: noteData.description,
      lecturer_name: noteData.lecturer_name,
      added_date: noteData.added_date || currentDate,
      file_url: noteData.file_url,
      // Store extended fields
      id: noteId,
      updated_date: noteData.updated_date || currentDate,
      created_by: noteData.created_by,
      tags: noteData.tags || [],
      file_size: noteData.file_size,
      file_type: noteData.file_type,
    };

    if (!course.notes) {
      course.notes = [];
    }

    course.notes.push(newRawNote as any);
    courses[courseIndex] = course;
    saveCourses(courses);

    // Return Note format
    const createdNote: Note = {
      id: noteId,
      title: noteData.title,
      description: noteData.description,
      lecturer_name: noteData.lecturer_name,
      added_date: noteData.added_date || currentDate,
      updated_date: noteData.updated_date || currentDate,
      created_by: noteData.created_by,
      tags: noteData.tags || [],
      file_url: noteData.file_url,
      file_size: noteData.file_size,
      file_type: noteData.file_type,
      course_id: noteData.course_id,
    };

    return NextResponse.json(createdNote, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

