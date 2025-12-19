// import { NextRequest, NextResponse } from 'next/server';
// import { readFileSync, writeFileSync } from 'fs';
// import { join } from 'path';
// import type { CourseGroup } from '@/lib/features/courses/data/interfaces/course';
// import type { Note } from '@/lib/features/notes/data/interfaces/note';

// const NOTES_FILE_PATH = join(process.cwd(), 'public', 'notes.json');

// function getCourses(): CourseGroup[] {
//   try {
//     const fileContent = readFileSync(NOTES_FILE_PATH, 'utf-8');
//     return JSON.parse(fileContent) as CourseGroup[];
//   } catch (error) {
//     console.error('Error reading notes.json:', error);
//     return [];
//   }
// }

// function saveCourses(courses: CourseGroup[]): void {
//   try {
//     writeFileSync(NOTES_FILE_PATH, JSON.stringify(courses, null, 2), 'utf-8');
//   } catch (error) {
//     console.error('Error writing notes.json:', error);
//     throw new Error('Failed to save courses');
//   }
// }

// function findNoteById(noteId: string): { course: CourseGroup; noteIndex: number; note: any } | null {
//   const courses = getCourses();
  
//   for (const course of courses) {
//     if (!course.notes || !Array.isArray(course.notes)) {
//       continue;
//     }
    
//     const noteIndex = course.notes.findIndex((n: any) => n.id === noteId);
//     if (noteIndex !== -1) {
//       return {
//         course,
//         noteIndex,
//         note: course.notes[noteIndex],
//       };
//     }
//   }
  
//   return null;
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     // TODO: Add admin authentication check
//     // const user = await getCurrentUser(request);
//     // if (!user || user.role?.name !== Role.ADMIN) {
//     //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
//     // }

//     const { id } = await params;
//     const decodedId = decodeURIComponent(id);
//     const updates: Partial<Note> = await request.json();
    
//     const courses = getCourses();
//     const result = findNoteById(decodedId);
    
//     if (!result) {
//       return NextResponse.json(
//         { error: 'Note not found' },
//         { status: 404 }
//       );
//     }

//     const { course, noteIndex } = result;
//     const courseIndex = courses.findIndex(
//       (c) => `${c.level}-${c.semester}-${c.course_code}` === `${course.level}-${course.semester}-${course.course_code}`
//     );

//     if (courseIndex === -1) {
//       return NextResponse.json(
//         { error: 'Course not found' },
//         { status: 404 }
//       );
//     }

//     const currentDate = new Date().toISOString().split('T')[0];
//     const existingNote = course.notes[noteIndex];
    
//     // Update note while preserving structure
//     const updatedRawNote = {
//       ...existingNote,
//       title: updates.title ?? existingNote.title,
//       description: updates.description ?? existingNote.description,
//       lecturer_name: updates.lecturer_name ?? existingNote.lecturer_name,
//       added_date: updates.added_date ?? existingNote.added_date,
//       file_url: updates.file_url ?? existingNote.file_url,
//       updated_date: currentDate,
//       created_by: updates.created_by ?? existingNote.created_by,
//       tags: updates.tags ?? existingNote.tags ?? [],
//       file_size: updates.file_size ?? existingNote.file_size,
//       file_type: updates.file_type ?? existingNote.file_type,
//       id: existingNote.id || decodedId,
//     };

//     courses[courseIndex].notes[noteIndex] = updatedRawNote;
//     saveCourses(courses);

//     // Return Note format
//     const courseId = `${course.level}-${course.semester}-${course.course_code}`;
//     const updatedNote: Note = {
//       id: updatedRawNote.id,
//       title: updatedRawNote.title,
//       description: updatedRawNote.description,
//       lecturer_name: updatedRawNote.lecturer_name,
//       added_date: updatedRawNote.added_date,
//       updated_date: updatedRawNote.updated_date,
//       created_by: updatedRawNote.created_by,
//       tags: updatedRawNote.tags || [],
//       file_url: updatedRawNote.file_url,
//       file_size: updatedRawNote.file_size,
//       file_type: updatedRawNote.file_type,
//       course_id: courseId,
//     };

//     return NextResponse.json(updatedNote);
//   } catch (error) {
//     console.error('Error updating note:', error);
//     return NextResponse.json(
//       { error: 'Failed to update note' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     // TODO: Add admin authentication check
//     // const user = await getCurrentUser(request);
//     // if (!user || user.role?.name !== Role.ADMIN) {
//     //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
//     // }

//     const { id } = await params;
//     const decodedId = decodeURIComponent(id);
    
//     const courses = getCourses();
//     const result = findNoteById(decodedId);
    
//     if (!result) {
//       return NextResponse.json(
//         { error: 'Note not found' },
//         { status: 404 }
//       );
//     }

//     const { course, noteIndex } = result;
//     const courseIndex = courses.findIndex(
//       (c) => `${c.level}-${c.semester}-${c.course_code}` === `${course.level}-${course.semester}-${course.course_code}`
//     );

//     if (courseIndex === -1) {
//       return NextResponse.json(
//         { error: 'Course not found' },
//         { status: 404 }
//       );
//     }

//     courses[courseIndex].notes.splice(noteIndex, 1);
//     saveCourses(courses);

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error deleting note:', error);
//     return NextResponse.json(
//       { error: 'Failed to delete note' },
//       { status: 500 }
//     );
//   }
// }

