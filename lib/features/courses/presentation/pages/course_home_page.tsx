"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { PdfViewer } from "@/lib/features/preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { useTranslation } from "@/lib/features/i18n";
import { useCourses } from "../../hooks";
import { CourseNoteItem } from "../components";
import { X, AlertCircle, RefreshCw, Calendar, Menu, Filter } from "lucide-react";
import Link from "next/link";
import { GithubButton } from "@/components/github/GithubButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function CourseHomePage() {
  const { t, locale } = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleNotesCount, setVisibleNotesCount] = useState(7);
  const [sheetOpen, setSheetOpen] = useState(false);
  const notesContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    setIsFullscreen((v) => !v);
  };

  const {
    state: {
      loading,
      error,
      selectedLevel,
      selectedSemester,
      selectedCourse,
      searchQuery,
      selectedNote,
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
      reloadNotes,
    },
  } = useCourses();

  const levelOptions: ComboboxOption[] = [
    { value: '', label: t('home.allLevels') },
    ...levels.map((level) => ({ value: level, label: level })),
  ];

  const semesterOptions: ComboboxOption[] = [
    { value: '', label: t('home.allSemesters') },
    ...semesters.map((sem) => ({ value: sem, label: sem })),
  ];

  const courseOptions: ComboboxOption[] = [
    { value: '', label: t('home.allCourses') },
    ...courses.map((course) => ({ value: course, label: course })),
  ];

  // Flatten all notes from all groups into a single array with group info
  const allNotes = useMemo(() => {
    const notes: Array<{
      note: typeof filteredGroups[0]['notes'][0];
      group: typeof filteredGroups[0];
    }> = [];
    filteredGroups.forEach((group) => {
      group.notes.forEach((note) => {
        notes.push({ note, group });
      });
    });
    return notes;
  }, [filteredGroups]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleNotesCount(7);
  }, [selectedLevel, selectedSemester, selectedCourse, searchQuery]);

  // Handle scroll to load more
  useEffect(() => {
    const container = notesContainerRef.current;
    if (!container || allNotes.length <= visibleNotesCount) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Load more when within 100px of bottom
      if (scrollHeight - scrollTop - clientHeight < 100) {
        setVisibleNotesCount((prev) => Math.min(prev + 7, allNotes.length));
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [allNotes.length, visibleNotesCount]);

  // Get visible notes
  const visibleNotes = useMemo(() => {
    return allNotes.slice(0, visibleNotesCount);
  }, [allNotes, visibleNotesCount]);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-6 text-zinc-900 dark:text-zinc-100 overflow-hidden">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 overflow-hidden md:h-full">
        <header className="flex shrink-0 flex-col gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <h1 className="text-sm sm:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                {t('home.title')}
              </h1>
              <p className="hidden sm:block text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {t('home.description')}
              </p>
            </div>
            {/* Desktop: Show all controls */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <Link href="/calendar">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label={t('common.calendar')}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </Link>
              <ThemeSwitcher />
              <LanguageSwitcher />
              <GithubButton />
            </div>
            {/* Mobile: Show calendar, filters, and menu buttons */}
            <div className="flex sm:hidden items-center gap-2 shrink-0">
              <Link href="/calendar">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label={t('common.calendar')}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setFiltersOpen(true)}
                aria-label={t('common.filters')}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    aria-label="Menu"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Options</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                        Theme
                      </label>
                      <ThemeSwitcher variant="buttons" showLabels={true} />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                        Language
                      </label>
                      <LanguageSwitcher variant="buttons" showLabels={true} />
                    </div>
                    <div className="flex justify-center">
                      <a
                        href="https://github.com/yunweneric/ccmc_notes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        <GithubButton showStars={false} />
                        <span>View on GitHub</span>
                      </a>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Recent courses section with skeleton loader */}
        {error ? (
          <section className="flex shrink-0 flex-col gap-3 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{t('home.unableToLoadNotes')}</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-500">{error}</p>
            <Button
              type="button"
              onClick={() => reloadNotes()}
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2 self-start border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t('common.reload')}
            </Button>
          </section>
        ) : loading ? (
          <section className="flex shrink-0 flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {t('home.recentlyAddedCourses')}
              </span>
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {[1, 2, 3, 4].map((idx) => (
                <div
                  key={idx}
                  className="min-w-[16rem] rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2"
                >
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-5/6" />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : recentCourses.length > 0 && (
          <section className="flex shrink-0 flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-sm">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {t('home.recentlyAddedCourses')}
              </span>
              <span>{recentCourses.length} {t('common.shown')}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentCourses.map((rc) => {
                const addedDate = new Date(rc.latestAddedDate);
                const formattedDate = Number.isNaN(addedDate.getTime())
                  ? rc.latestAddedDate
                  : addedDate.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                return (
                  <button
                    key={rc.course_code}
                    type="button"
                    onClick={() =>
                      handleSelectNote(
                        {
                          level: rc.level,
                          semester: rc.semester,
                          course: rc.course,
                          course_code: rc.course_code,
                          notes: [rc.note],
                        },
                        rc.note,
                      )
                    }
                    className="min-w-[16rem] rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-left text-xs transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {rc.course}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                      {rc.latestNoteTitle}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300">
                          {t('home.level')} {rc.level}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                          {t('home.semester')} {rc.semester}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-500 shrink-0">{formattedDate}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Desktop / tablet filters inline */}
        <section className="hidden shrink-0 flex-col gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-card dark:bg-zinc-900 p-4 shadow-sm md:flex">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {t('home.filterNotes')}
            </p>
            <div className="w-full max-w-xs">
              <Input
                placeholder={t('home.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid w-full gap-3 pt-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] md:items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t('home.level')}
              </label>
              <Combobox
                aria-label={t('home.level')}
                value={selectedLevel}
                onChange={(value) => {
                  setSelectedLevel(value);
                  setSelectedSemester('');
                  setSelectedCourse('');
                }}
                options={levelOptions}
                placeholder={t('home.allLevels')}
                className="h-9"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t('home.semester')}
              </label>
              <Combobox
                aria-label={t('home.semester')}
                value={selectedSemester}
                onChange={(value) => {
                  setSelectedSemester(value);
                  setSelectedCourse('');
                }}
                options={semesterOptions}
                placeholder={t('home.allSemesters')}
                className="h-9"
              />
            </div>

            <div className="flex flex-col gap-1 md:min-w-[10rem]">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {t('home.course')}
              </label>
              <Combobox
                aria-label={t('home.course')}
                value={selectedCourse}
                onChange={(value) => setSelectedCourse(value)}
                options={courseOptions}
                placeholder={t('home.allCourses')}
                className="h-9 min-w-[10rem]"
              />
            </div>
          </div>
          
          {/* Active filters as chips */}
          {(selectedLevel || selectedSemester || selectedCourse) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {selectedLevel && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                  <span>{t('home.level')} {selectedLevel}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLevel('');
                      setSelectedSemester('');
                      setSelectedCourse('');
                    }}
                    className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    aria-label={`Remove ${t('home.level')} ${selectedLevel} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedSemester && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <span>{t('home.semester')} {selectedSemester}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSemester('');
                      setSelectedCourse('');
                    }}
                    className="rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                    aria-label={`Remove ${t('home.semester')} ${selectedSemester} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedCourse && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300">
                  <span>{selectedCourse}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCourse('')}
                    className="rounded-full p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                    aria-label={`Remove ${selectedCourse} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <span>{t('home.clearAll')}</span>
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </section>

        {/* Mobile filters sidebar / drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              className="fixed inset-0 z-40 flex md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                type="button"
                aria-label="Close filters"
                className="h-full w-full bg-black/30"
                onClick={() => setFiltersOpen(false)}
              />
              <motion.aside
                className="relative ml-auto flex h-full w-80 flex-col gap-3 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-xl"
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
              >
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t('common.filters')}
                  </h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {t('home.adjustFilters')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFiltersOpen(false)}
                >
                  {t('home.closeFilters')}
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <Input
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {t('home.level')}
                    </label>
                    <Combobox
                      aria-label={t('home.level')}
                      value={selectedLevel}
                      onChange={(value) => {
                        setSelectedLevel(value);
                        setSelectedSemester("");
                        setSelectedCourse("");
                      }}
                      options={levelOptions}
                      placeholder={t('home.allLevels')}
                      className="h-9"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {t('home.semester')}
                    </label>
                    <Combobox
                      aria-label={t('home.semester')}
                      value={selectedSemester}
                      onChange={(value) => {
                        setSelectedSemester(value);
                        setSelectedCourse("");
                      }}
                      options={semesterOptions}
                      placeholder={t('home.allSemesters')}
                      className="h-9"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {t('home.course')}
                    </label>
                    <Combobox
                      aria-label={t('home.course')}
                      value={selectedCourse}
                      onChange={(value) => setSelectedCourse(value)}
                      options={courseOptions}
                      placeholder={t('home.allCourses')}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleResetFilters();
                    setFiltersOpen(false);
                  }}
                >
                  {t('home.clearFilters')}
                </Button>
                <p>
                  {t('home.showingNotesFor')}{' '}
                  {selectedLevel ? `${t('home.level')} ${selectedLevel}` : t('home.allLevels')},{' '}
                  {selectedSemester
                    ? `${t('home.semester')} ${selectedSemester}`
                    : t('home.allSemesters')}
                  , {selectedCourse || t('home.allCourses')}.
                </p>
              </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden md:flex-row">
          <div className="flex min-h-0 w-full flex-col gap-3 md:w-[45%]">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{t('home.notes')}</span>
              {loading ? (
                <span>{t('common.loading')}</span>
              ) : (
                <span>
                  {filteredGroups.reduce(
                    (acc, g) => acc + g.notes.length,
                    0,
                  )}{' '}
                  {t('home.notesCount')}
                </span>
              )}
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              {error ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
                  <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {t('home.unableToLoadNotes')}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {error}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => reloadNotes()}
                    className="inline-flex items-center gap-2"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t('common.reload')}
                  </Button>
                </div>
              ) : loading ? (
                <div className="h-full w-full overflow-auto p-3">
                  {/* Skeleton loader for note groups */}
                  {[1, 2, 3].map((groupIdx) => (
                    <div key={groupIdx} className="mb-3 last:mb-0 w-full">
                      {/* Group header skeleton */}
                      <div className="mb-2 flex items-center gap-2 w-full">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 flex-1" />
                      </div>
                      {/* Note items skeleton */}
                      <ul className="space-y-2 w-full">
                        {[1, 2, 3].map((noteIdx) => (
                            <li
                              key={noteIdx}
                              className="flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 w-full"
                            >
                              <div className="flex items-start justify-between gap-2 w-full">
                                <div className="min-w-0 flex-1">
                                  <Skeleton className="h-4 w-3/4 mb-2" />
                                  <Skeleton className="h-3 w-full mb-1" />
                                  <Skeleton className="h-3 w-5/6" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full shrink-0" />
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 w-full">
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-24 rounded-full" />
                                <Skeleton className="ml-auto h-4 w-32" />
                              </div>
                            </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('home.noNotesFound')}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {t('home.tryAdjustingFilters')}
                  </p>
                </div>
              ) : (
                <div 
                  ref={notesContainerRef}
                  className="h-full overflow-auto p-3"
                >
                  {visibleNotes.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('home.noNotesFound')}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        {t('home.tryAdjustingFilters')}
                      </p>
                    </div>
                  ) : (
                    <>
                      {visibleNotes.map(({ note, group }, index) => {
                        // Check if this is the first note of a new group
                        const isFirstInGroup = index === 0 || 
                          visibleNotes[index - 1].group.course_code !== group.course_code;
                        
                        return (
                          <div key={`${note.title}-${note.added_date}-${note.file_url}`} className={isFirstInGroup && index > 0 ? "mt-3" : ""}>
                            {isFirstInGroup && (
                              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-700 dark:text-zinc-300">
                                  {t('home.level')} {group.level}
                                </span>
                                <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-700 dark:text-zinc-300">
                                  {t('home.semester')} {group.semester}
                                </span>
                                <span className="truncate text-zinc-800 dark:text-zinc-200">
                                  {group.course}
                                </span>
                              </div>
                            )}
                            <div className={isFirstInGroup ? "" : "mt-2"}>
                              <CourseNoteItem
                                note={note}
                                level={group.level}
                                semester={group.semester}
                                course={group.course}
                                onOpen={() => handleSelectNote(group, note)}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {visibleNotesCount < allNotes.length && (
                        <div className="mt-4 flex items-center justify-center py-2">
                          <div className="h-1 w-1 animate-pulse rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex min-h-0 w-full flex-col md:mt-0 md:w-[55%]">
            <div className="mb-2 block shrink-0 text-xs text-zinc-500 dark:text-zinc-400 md:hidden">
              {t('home.selectNoteToOpen')}
            </div>
            <div className="hidden min-h-0 flex-1 md:block">
              <PdfViewer
                fileUrl={selectedNote?.file_url ?? null}
                title={selectedNote?.title}
                courseCode={selectedNote?.course_code}
                onFullscreen={toggleFullscreen}
              />
            </div>
          </div>
        </section>
      </main>

      {isFullscreen && selectedNote && (
        <div className="fixed inset-0 z-50 bg-black">
          <PdfViewer
            fileUrl={selectedNote.file_url}
            title={selectedNote.title}
            courseCode={selectedNote.course_code}
            showPreviewButton={false}
            layoutVariant="overlay"
            onClose={toggleFullscreen}
          />
        </div>
      )}
    </div>
  );
}


