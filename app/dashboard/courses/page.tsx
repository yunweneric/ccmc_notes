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
import { useAdminCourses } from "@/lib/features/courses/hooks/use_admin_courses"
import { CoursesTable } from "@/lib/features/courses/presentation/components/courses_table"
import { CourseFormModal } from "@/lib/features/courses/presentation/components/course_form_modal"
import type { CourseGroup } from "@/lib/features/courses/data/interfaces/course"
import type { CourseFormData } from "@/lib/features/courses/data/schemas/course_schema"

export default function DashboardCoursesPage() {
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const { courses, loading, error, createCourse, updateCourse, deleteCourse } = useAdminCourses()
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseGroup | null>(null)
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role?.name !== Role.ADMIN) {
      router.replace("/")
    }
  }, [user, authLoading, router])

  const handleAddCourse = useCallback(() => {
    setSelectedCourse(null)
    setIsFormModalOpen(true)
  }, [])

  const handleEditCourse = useCallback((course: CourseGroup) => {
    setSelectedCourse(course)
    setIsFormModalOpen(true)
  }, [])

  const handleDeleteClick = useCallback((id: string) => {
    const course = courses.find(
      (c) => `${c.level}-${c.semester}-${c.course_code}` === id
    )
    if (course) {
      setCourseToDelete({
        id,
        name: `${course.course_code} - ${course.course}`,
      })
    }
  }, [courses])

  const handleDeleteConfirm = useCallback(async () => {
    if (!courseToDelete) return

    const result = await deleteCourse(courseToDelete.id)
    if (result) {
      toast.success("Course deleted successfully")
      setCourseToDelete(null)
    } else {
      toast.error("Failed to delete course")
    }
  }, [courseToDelete, deleteCourse])

  const handleFormSubmit = useCallback(
    async (data: CourseFormData) => {
      if (selectedCourse) {
        // Update existing course
        const courseId = `${selectedCourse.level}-${selectedCourse.semester}-${selectedCourse.course_code}`
        const result = await updateCourse(courseId, {
          ...data,
          notes: selectedCourse.notes || [],
        })
        if (result) {
          toast.success("Course updated successfully")
          setIsFormModalOpen(false)
          setSelectedCourse(null)
        } else {
          toast.error("Failed to update course")
        }
      } else {
        // Create new course
        const newCourse: CourseGroup = {
          ...data,
          notes: [],
        }
        const result = await createCourse(newCourse)
        if (result) {
          toast.success("Course created successfully")
          setIsFormModalOpen(false)
        } else {
          toast.error("Failed to create course")
        }
      }
    },
    [selectedCourse, createCourse, updateCourse]
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
                    Courses Management
                  </h1>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Manage course notes, lectures, and course information.
                  </p>
                </div>
                <Button onClick={handleAddCourse}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <CoursesTable
                data={courses}
                loading={loading}
                onEdit={handleEditCourse}
                onDelete={handleDeleteClick}
              />
            </div>
          </div>
        </div>
      </SidebarInset>

      <CourseFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        course={selectedCourse}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course "{courseToDelete?.name}".
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

