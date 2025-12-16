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
    reload: string;
    calendar: string;
    apply: string;
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
    clearAll: string;
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
    adjustFilters: string;
    selectNoteToOpen: string;
    closeFilters: string;
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
    zoomIn: string;
    zoomOut: string;
    zoomFit: string;
    zoomActual: string;
    print: string;
    export: string;
    exportPdf: string;
    exportImage: string;
    spread: string;
    spreadNone: string;
    spreadOdd: string;
    spreadEven: string;
    copyText: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  timetable: {
    addSchedule: string;
    editSchedule: string;
    deleteSchedule: string;
    courseCode: string;
    courseName: string;
    day: string;
    startTime: string;
    endTime: string;
    location: string;
    lecturer: string;
    save: string;
    cancel: string;
    delete: string;
    confirmDelete: string;
  };
  auth: {
    login: string;
    welcome: string;
    loginDescription: string;
    email: string;
    emailPlaceholder: string;
    emailRequired: string;
    invalidEmail: string;
    password: string;
    passwordPlaceholder: string;
    passwordRequired: string;
    loginButton: string;
    loggingIn: string;
    processing: string;
    loginError: string;
    invalidCredentials: string;
    adminNote: string;
  };
}

