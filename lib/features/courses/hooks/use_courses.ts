'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type CourseGroup,
  type RawNote,
  type RecentCourse,
  type SelectedNote,
} from '../data/interfaces';
import { courseService } from '../data/services';

export function useCourses() {
  const router = useRouter();

  const [data, setData] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<SelectedNote | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [defaultsInitialized, setDefaultsInitialized] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    const { data: notes, error: err } = await courseService.list();
    if (err) {
      console.error(err);
      setError('Could not load notes. Please try again later.');
      setData([]);
    } else {
      setData(notes);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadNotes();
  }, []);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    };

    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  // Initialize default filters to Level 100, Semester 1 if available
  useEffect(() => {
    if (defaultsInitialized || data.length === 0) return;

    const hasLevel100 = data.some((g) => g.level === '100');
    const hasSemester1 = data.some((g) => g.semester === '1');

    if (hasLevel100) {
      setSelectedLevel('100');
    }
    if (hasSemester1) {
      setSelectedSemester('1');
    }

    setDefaultsInitialized(true);
  }, [data, defaultsInitialized]);

  const levels = useMemo(
    () => Array.from(new Set(data.map((g) => g.level))).sort(),
    [data],
  );

  const semesters = useMemo(() => {
    const filtered = selectedLevel
      ? data.filter((g) => g.level === selectedLevel)
      : data;
    return Array.from(new Set(filtered.map((g) => g.semester))).sort();
  }, [data, selectedLevel]);

  const courses = useMemo(() => {
    let filtered = data;
    if (selectedLevel) {
      filtered = filtered.filter((g) => g.level === selectedLevel);
    }
    if (selectedSemester) {
      filtered = filtered.filter((g) => g.semester === selectedSemester);
    }
    return Array.from(new Set(filtered.map((g) => g.course))).sort();
  }, [data, selectedLevel, selectedSemester]);

  const filteredGroups = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return data
      .map((g) => {
        if (selectedLevel && g.level !== selectedLevel) return false;
        if (selectedSemester && g.semester !== selectedSemester) return false;
        if (selectedCourse && g.course !== selectedCourse) return false;
        if (!search) return g;

        const notes = g.notes.filter((note) => {
          const haystack = `${note.title} ${note.description} ${note.lecturer_name}`.toLowerCase();
          return haystack.includes(search);
        });

        if (notes.length === 0) return null;
        return { ...g, notes };
      })
      .filter((g): g is CourseGroup => g !== null && g !== false);
  }, [data, selectedLevel, selectedSemester, selectedCourse, searchQuery]);

  const recentCourses = useMemo<RecentCourse[]>(() => {
    const map = new Map<string, RecentCourse>();

    for (const group of data) {
      for (const note of group.notes) {
        const key = `${group.course_code}`;
        const existing = map.get(key);

        const addedDate = new Date(note.added_date);
        const currentTime = addedDate.getTime();

        if (!existing) {
          map.set(key, {
            level: group.level,
            semester: group.semester,
            course: group.course,
            course_code: group.course_code,
            latestNoteTitle: note.title,
            latestAddedDate: note.added_date,
            note,
          });
        } else {
          const existingTime = new Date(existing.latestAddedDate).getTime();
          if (!Number.isNaN(currentTime) && currentTime > existingTime) {
            existing.latestNoteTitle = note.title;
            existing.latestAddedDate = note.added_date;
            existing.note = note;
          }
        }
      }
    }

    return Array.from(map.values())
      .sort(
        (a, b) =>
          new Date(b.latestAddedDate).getTime() -
          new Date(a.latestAddedDate).getTime(),
      )
      .slice(0, 6);
  }, [data]);

  const handleResetFilters = () => {
    setSelectedLevel('');
    setSelectedSemester('');
    setSelectedCourse('');
    setSearchQuery('');
  };

  const openNote = (group: CourseGroup, note: RawNote) => {
    const enriched: SelectedNote = {
      ...note,
      level: group.level,
      semester: group.semester,
      course: group.course,
      course_code: group.course_code,
    };

    if (isMobile) {
      const params = new URLSearchParams({
        title: enriched.title,
        fileUrl: enriched.file_url,
        courseCode: enriched.course_code,
      });
      router.push(`/preview?${params.toString()}`);
    } else {
      setSelectedNote(enriched);
    }
  };

  const handleSelectNote = (group: CourseGroup, note: RawNote) => {
    openNote(group, note);
  };

  return {
    state: {
      data,
      loading,
      error,
      selectedLevel,
      selectedSemester,
      selectedCourse,
      searchQuery,
      selectedNote,
      isMobile,
    },
    derived: {
      levels,
      semesters,
      courses,
      filteredGroups,
      recentCourses,
    },
    actions: {
      setSelectedLevel,
      setSelectedSemester,
      setSelectedCourse,
      setSearchQuery,
      handleResetFilters,
      handleSelectNote,
      reloadNotes: loadNotes,
    },
  };
}


