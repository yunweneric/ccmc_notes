"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { PdfViewer } from "@/lib/preview/components/PdfViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/hooks";
import { useCourses } from "../../hooks/useCourses";
import { CourseNoteItem } from "../components/CourseNoteItem";

export function CourseHomePage() {
  const { t, locale } = useTranslation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-6 text-zinc-900 dark:text-zinc-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="flex items-start justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('home.title')}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {t('home.description')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 inline-flex items-center gap-1 md:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              {t('common.filters')}
            </Button>
          </div>
        </header>

        {recentCourses.length > 0 && (
          <section className="flex flex-col gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-sm">
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
                    className="min-w-[11rem] rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-left text-xs hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {rc.course}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                      {rc.latestNoteTitle}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-500">
                      <span>
                        {t('home.level')} {rc.level} • {t('home.semester')} {rc.semester}
                      </span>
                      <span>{formattedDate}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Desktop / tablet filters inline */}
        <section className="hidden flex-col gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-card dark:bg-zinc-900 p-4 shadow-sm md:flex">
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

          <div className="grid w-full gap-3 pt-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto] md:items-end">
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

            <Button
              type="button"
              onClick={handleResetFilters}
              variant="outline"
              size="sm"
              className="mt-2 w-full md:mt-0 md:w-auto md:justify-self-end"
            >
              {t('home.clearFilters')}
            </Button>
          </div>
          <p className="pt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t('home.showingNotesFor')}{' '}
            {selectedLevel ? `${t('home.level')} ${selectedLevel}` : t('home.allLevels')},{' '}
            {selectedSemester
              ? `${t('home.semester')} ${selectedSemester}`
              : t('home.allSemesters')}
            , {selectedCourse || t('home.allCourses')}.
          </p>
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

        <section className="flex flex-1 flex-col gap-4 md:flex-row">
          <div className="flex w-full flex-col gap-3 md:w-[45%]">
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

            <div className="flex-1 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              {error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-1 p-4 text-center text-sm text-red-600 dark:text-red-400">
                  <p className="font-medium">{t('home.unableToLoadNotes')}</p>
                  <p className="text-xs text-red-500 dark:text-red-500">{error}</p>
                </div>
              ) : loading ? (
                <div className="flex h-64 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
                  {t('home.loadingNotes')}
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-1 p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">{t('home.noNotesFound')}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {t('home.tryAdjustingFilters')}
                  </p>
                </div>
              ) : (
                <div className="h-[26rem] overflow-auto p-3">
                  {filteredGroups.map((group) => (
                    <div
                      key={`${group.level}-${group.semester}-${group.course}`}
                      className="mb-3 last:mb-0"
                    >
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
                      <ul className="space-y-2">
                        {group.notes.map((note) => (
                          <CourseNoteItem
                            key={`${note.title}-${note.added_date}-${note.file_url}`}
                            note={note}
                            level={group.level}
                            semester={group.semester}
                            course={group.course}
                            onOpen={() => handleSelectNote(group, note)}
                          />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 w-full md:mt-0 md:w-[55%]">
            <div className="mb-2 block text-xs text-zinc-500 dark:text-zinc-400 md:hidden">
              {t('home.selectNoteToOpen')}
            </div>
            <div className="hidden h-[26rem] md:block">
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


