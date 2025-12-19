"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAuthContext } from "@/lib/features/auth"
import { Role } from "@/lib/features/auth/data/interfaces/auth"
import { useAdminNotes } from "@/lib/features/notes/hooks/use_admin_notes"
import { useAdminCourses } from "@/lib/features/courses/hooks/use_admin_courses"
import { NotesTable } from "@/lib/features/notes/presentation/components/notes_table"
import { NoteFormModal } from "@/lib/features/notes/presentation/components/note_form_modal"
import type { Note } from "@/lib/features/notes/data/interfaces/note"
import type { NoteFormData } from "@/lib/features/notes/data/schemas/note_schema"

export default function DashboardNotesPage() {
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const { notes, loading, error, createNote, updateNote, deleteNote } = useAdminNotes()
  const { courses } = useAdminCourses()
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role?.name !== Role.ADMIN) {
      router.replace("/")
    }
  }, [user, authLoading, router])

  const handleAddNote = useCallback(() => {
    setSelectedNote(null)
    setIsFormModalOpen(true)
  }, [])

  const handleEditNote = useCallback((note: Note) => {
    setSelectedNote(note)
    setIsFormModalOpen(true)
  }, [])

  const handleDeleteClick = useCallback((id: string) => {
    const note = notes.find((n) => n.id === id)
    if (note) {
      setNoteToDelete({
        id,
        title: note.title,
      })
    }
  }, [notes])

  const handleDeleteConfirm = useCallback(async () => {
    if (!noteToDelete) return

    const result = await deleteNote(noteToDelete.id)
    if (result) {
      toast.success("Note deleted successfully")
      setNoteToDelete(null)
    } else {
      toast.error("Failed to delete note")
    }
  }, [noteToDelete, deleteNote])

  const handleFormSubmit = useCallback(
    async (data: NoteFormData & { tags?: string[] }) => {
      const currentDate = new Date().toISOString().split('T')[0]
      
      if (selectedNote) {
        // Update existing note
        const result = await updateNote(selectedNote.id, {
          ...data,
          updated_date: currentDate,
        })
        if (result) {
          toast.success("Note updated successfully")
          setIsFormModalOpen(false)
          setSelectedNote(null)
        } else {
          toast.error("Failed to update note")
        }
      } else {
        // Create new note
        const newNote: Omit<Note, 'id'> = {
          course_id: data.course_id,
          title: data.title,
          description: data.description,
          lecturer_name: data.lecturer_name,
          added_date: currentDate,
          updated_date: currentDate,
          created_by: user?.email || user?.uid || undefined,
          file_url: data.file_url,
          tags: data.tags || [],
          file_size: data.file_size,
          file_type: data.file_type,
        }
        const result = await createNote(newNote)
        if (result) {
          toast.success("Note created successfully")
          setIsFormModalOpen(false)
        } else {
          toast.error("Failed to create note")
        }
      }
    },
    [selectedNote, createNote, updateNote]
  )

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error.message}`)
    }
  }, [error])

  if (authLoading || !user || user.role?.name !== Role.ADMIN) {
    return null
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Notes Management
                  </h1>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Manage course notes, lectures, and related files.
                  </p>
                </div>
                <Button onClick={handleAddNote}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <NotesTable
                data={notes}
                loading={loading}
                courses={courses}
                onEdit={handleEditNote}
                onDelete={handleDeleteClick}
              />
            </div>
          </div>
        </div>
      </SidebarInset>

      <NoteFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        note={selectedNote}
        courses={courses}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={!!noteToDelete}
        onOpenChange={(open) => !open && setNoteToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the note "{noteToDelete?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}

