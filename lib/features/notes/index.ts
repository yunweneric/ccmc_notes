// Data layer exports
export type { Note, RawNote } from './data/interfaces/note';
export { noteSchema, type NoteFormData } from './data/schemas/note_schema';
export { noteService, NoteService } from './data/services/note_service';

// Hooks exports
export { useAdminNotes } from './hooks/use_admin_notes';

// Presentation layer exports
export { NotesTable } from './presentation/components/notes_table';
export { NoteFormModal } from './presentation/components/note_form_modal';
export { createNotesTableColumns } from './presentation/components/notes_table_columns';

