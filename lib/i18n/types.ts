export type Locale = 'en' | 'fr';

export interface Translations {
  common: {
    loading: string;
    error: string;
    open: string;
    close: string;
    back: string;
    filters: string;
    clear: string;
    search: string;
    all: string;
    shown: string;
  };
  home: {
    title: string;
    description: string;
    recentlyAddedCourses: string;
    filterNotes: string;
    allLevels: string;
    allSemesters: string;
    allCourses: string;
    clearFilters: string;
    searchPlaceholder: string;
    notes: string;
    notesCount: string;
    noNotesFound: string;
    tryAdjustingFilters: string;
    loadingNotes: string;
    unableToLoadNotes: string;
    level: string;
    semester: string;
    course: string;
    showingNotesFor: string;
  };
  preview: {
    title: string;
    description: string;
    backToNotes: string;
    levelSemester: string;
    pressEscapeToExit: string;
  };
  pdfViewer: {
    noNoteSelected: string;
    chooseNoteFromList: string;
    loadingPdfViewer: string;
    unableToInitialize: string;
    engineFailedToLoad: string;
    checkConnection: string;
    openInPreview: string;
    pages: string;
    showThumbnails: string;
    hideThumbnails: string;
    closeFullscreen: string;
    enterFullscreen: string;
    exitFullscreen: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
}

