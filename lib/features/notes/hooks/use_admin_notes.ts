'use client';

import { useState, useEffect, useCallback } from 'react';
import { noteService } from '../data/services';
import type { Note } from '../data/interfaces/note';

export function useAdminNotes(courseId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await noteService.list(courseId);
    if (err) {
      setError(err);
      setNotes([]);
    } else {
      setNotes(data);
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(
    async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
      setError(null);
      const { data, error: err } = await noteService.create(noteData);
      if (err) {
        setError(err);
        return null;
      }
      if (data) {
        await fetchNotes();
        return data;
      }
      return null;
    },
    [fetchNotes]
  );

  const updateNote = useCallback(
    async (id: string, noteData: Partial<Note>): Promise<Note | null> => {
      setError(null);
      const { data, error: err } = await noteService.update(id, noteData);
      if (err) {
        setError(err);
        return null;
      }
      if (data) {
        await fetchNotes();
        return data;
      }
      return null;
    },
    [fetchNotes]
  );

  const deleteNote = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);
      const { error: err } = await noteService.delete(id);
      if (err) {
        setError(err);
        return false;
      }
      await fetchNotes();
      return true;
    },
    [fetchNotes]
  );

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
}

