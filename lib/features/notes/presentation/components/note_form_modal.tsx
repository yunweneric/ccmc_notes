'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Using native textarea since Textarea component may not exist
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type NoteFormData } from '../../data/schemas/note_schema';
import type { Note } from '../../data/interfaces/note';
import type { CourseGroup } from '@/lib/features/courses/data/interfaces/course';

interface NoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note | null;
  courses: CourseGroup[];
  onSubmit: (data: NoteFormData & { tags?: string[] }) => Promise<void>;
}

export function NoteFormModal({
  open,
  onOpenChange,
  note,
  courses,
  onSubmit,
}: NoteFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NoteFormData & { tags?: string[] }>({
    course_id: '',
    title: '',
    description: '',
    lecturer_name: '',
    file_url: '',
    tags: [],
  });
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof NoteFormData, string>>>({});
  const isEditMode = !!note;

  useEffect(() => {
    if (note) {
      setFormData({
        course_id: note.course_id,
        title: note.title,
        description: note.description,
        lecturer_name: note.lecturer_name,
        file_url: note.file_url,
        tags: note.tags || [],
        file_size: note.file_size,
        file_type: note.file_type,
      });
      setTagsInput((note.tags || []).join(', '));
    } else {
      setFormData({
        course_id: '',
        title: '',
        description: '',
        lecturer_name: '',
        file_url: '',
        tags: [],
      });
      setTagsInput('');
    }
    setErrors({});
  }, [note, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NoteFormData, string>> = {};
    
    if (!formData.course_id) {
      newErrors.course_id = 'Course is required';
    }
    if (!formData.title) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    if (!formData.lecturer_name) {
      newErrors.lecturer_name = 'Lecturer name is required';
    }
    if (!formData.file_url) {
      newErrors.file_url = 'File URL is required';
    } else {
      try {
        new URL(formData.file_url);
      } catch {
        newErrors.file_url = 'File URL must be a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse tags from input
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const submitData = {
      ...formData,
      tags,
    };
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(submitData);
      onOpenChange(false);
      setFormData({
        course_id: '',
        title: '',
        description: '',
        lecturer_name: '',
        file_url: '',
        tags: [],
      });
      setTagsInput('');
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const courseOptions = courses.map((course) => {
    const courseId = `${course.level}-${course.semester}-${course.course_code}`;
    return {
      id: courseId,
      label: `${course.course_code} - ${course.course} (Level ${course.level}, Semester ${course.semester})`,
    };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Note' : 'Add New Note'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the note information below.'
              : 'Fill in the details to add a new note.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_id">Course *</Label>
            <Select
              value={formData.course_id}
              onValueChange={(value) => setFormData({ ...formData, course_id: value })}
            >
              <SelectTrigger id="course_id">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courseOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.course_id && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.course_id}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Lecture 1 – Introduction"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              placeholder="Enter note description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lecturer_name">Lecturer Name *</Label>
            <Input
              id="lecturer_name"
              placeholder="e.g., Dr. John Doe"
              value={formData.lecturer_name}
              onChange={(e) => setFormData({ ...formData, lecturer_name: e.target.value })}
            />
            {errors.lecturer_name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.lecturer_name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="file_url">File URL *</Label>
            <Input
              id="file_url"
              type="url"
              placeholder="https://example.com/file.pdf"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
            />
            {errors.file_url && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.file_url}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g., lecture, tutorial, exam (comma-separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter tags separated by commas
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                  ? 'Update Note'
                  : 'Create Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

