import type { Note } from '../interfaces/note';

export class NoteService {
  async list(courseId?: string): Promise<{ data: Note[]; error: Error | null }> {
    try {
      const url = courseId ? `/api/notes?course_id=${encodeURIComponent(courseId)}` : '/api/notes';
      const res = await fetch(url);
      if (!res.ok) {
        return {
          data: [],
          error: new Error(`Failed to load notes (${res.status})`),
        };
      }
      const json = (await res.json()) as Note[];
      return { data: json, error: null };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async create(note: Omit<Note, 'id'>): Promise<{ data: Note | null; error: Error | null }> {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });
      if (!res.ok) {
        const error = await res.json();
        return {
          data: null,
          error: new Error(error.message || `Failed to create note (${res.status})`),
        };
      }
      const data = (await res.json()) as Note;
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async update(id: string, note: Partial<Note>): Promise<{ data: Note | null; error: Error | null }> {
    try {
      const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });
      if (!res.ok) {
        const error = await res.json();
        return {
          data: null,
          error: new Error(error.message || `Failed to update note (${res.status})`),
        };
      }
      const data = (await res.json()) as Note;
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
      const res = await fetch(`/api/notes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        return {
          error: new Error(error.message || `Failed to delete note (${res.status})`),
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

export const noteService = new NoteService();

