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
import type { CourseGroup } from '../../data/interfaces/course';

interface CoursesTableColumnsProps {
  onEdit: (course: CourseGroup) => void;
  onDelete: (id: string) => void;
}

export function createCoursesTableColumns({
  onEdit,
  onDelete,
}: CoursesTableColumnsProps): ColumnDef<CourseGroup>[] {
  return [
    {
      accessorKey: 'level',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Level
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <Badge variant="outline" className="font-mono">
            {row.getValue('level')}
          </Badge>
        );
      },
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'semester',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Semester
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <Badge variant="secondary">
            Semester {row.getValue('semester')}
          </Badge>
        );
      },
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'course_code',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Course Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="font-mono font-medium">
            {row.getValue('course_code')}
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
      accessorKey: 'course',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Course Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue('course')}</span>;
      },
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const cellValue = row.getValue(id) as string;
        return cellValue.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: 'notes',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Notes Count
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const notes = row.getValue('notes') as CourseGroup['notes'];
        return (
          <Badge variant="outline">
            {notes?.length || 0} {notes?.length === 1 ? 'note' : 'notes'}
          </Badge>
        );
      },
      sortingFn: (rowA, rowB) => {
        const notesA = (rowA.getValue('notes') as CourseGroup['notes'])?.length || 0;
        const notesB = (rowB.getValue('notes') as CourseGroup['notes'])?.length || 0;
        return notesA - notesB;
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const course = row.original;
        const courseId = `${course.level}-${course.semester}-${course.course_code}`;

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
                <DropdownMenuItem onClick={() => onEdit(course)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(courseId)}
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

