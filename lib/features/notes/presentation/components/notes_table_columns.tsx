'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Note } from '../../data/interfaces/note';
import type { CourseGroup } from '@/lib/features/courses/data/interfaces/course';

interface NotesTableColumnsProps {
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  courses: CourseGroup[];
}

function getCourseInfo(
  courseId: string,
  courses: CourseGroup[]
): { level: string; semester: string; code: string } | null {
  const [level, semester, ...codeParts] = courseId.split('-');
  const code = codeParts.join('-');
  const course = courses.find(
    (c) => `${c.level}-${c.semester}-${c.course_code}` === courseId
  );
  if (course) {
    return { level, semester, code: course.course_code };
  }
  return { level, semester, code };
}

export function createNotesTableColumns({
  onEdit,
  onDelete,
  courses,
}: NotesTableColumnsProps): ColumnDef<Note>[] {
  return [
    {
      accessorKey: 'course_id',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Course
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const courseId = row.getValue('course_id') as string;
        const courseInfo = getCourseInfo(courseId, courses);
        if (!courseInfo) {
          return <span className="text-muted-foreground">Unknown</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {courseInfo.level}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                S{courseInfo.semester}
              </Badge>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {courseInfo.code}
            </span>
          </div>
        );
      },
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const courseId = row.getValue(id) as string;
        return courseId === value;
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="font-medium max-w-[300px] truncate block">
            {row.getValue('title')}
          </span>
        );
      },
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string;
        return cellValue.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        return (
          <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
            {description}
          </span>
        );
      },
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string;
        return cellValue.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: 'lecturer_name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Lecturer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span className="text-sm">{row.getValue('lecturer_name')}</span>;
      },
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string;
        return cellValue.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: 'added_date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('added_date') as string;
        return <span className="text-sm">{date}</span>;
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.getValue('added_date') as string).getTime();
        const dateB = new Date(rowB.getValue('added_date') as string).getTime();
        return dateA - dateB;
      },
    },
    {
      accessorKey: 'updated_date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Updated
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue('updated_date') as string | undefined;
        return (
          <span className="text-sm text-muted-foreground">
            {date || '—'}
          </span>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = (rowA.getValue('updated_date') as string | undefined) || rowA.getValue('added_date') as string;
        const dateB = (rowB.getValue('updated_date') as string | undefined) || rowB.getValue('added_date') as string;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const note = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(note)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(note.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

