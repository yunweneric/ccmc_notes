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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type CourseFormData } from '../../data/schemas/course_schema';
import type { CourseGroup } from '../../data/interfaces/course';

interface CourseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: CourseGroup | null;
  onSubmit: (data: CourseFormData) => Promise<void>;
}

export function CourseFormModal({
  open,
  onOpenChange,
  course,
  onSubmit,
}: CourseFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    level: '',
    semester: '',
    course_code: '',
    course: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});
  const isEditMode = !!course;

  useEffect(() => {
    if (course) {
      setFormData({
        level: course.level,
        semester: course.semester,
        course_code: course.course_code,
        course: course.course,
      });
    } else {
      setFormData({
        level: '',
        semester: '',
        course_code: '',
        course: '',
      });
    }
    setErrors({});
  }, [course, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {};
    
    if (!formData.level) {
      newErrors.level = 'Level is required';
    }
    if (!formData.semester) {
      newErrors.semester = 'Semester is required';
    }
    if (!formData.course_code) {
      newErrors.course_code = 'Course code is required';
    }
    if (!formData.course) {
      newErrors.course = 'Course name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
      setFormData({
        level: '',
        semester: '',
        course_code: '',
        course: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the course information below.'
              : 'Fill in the details to add a new course.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {['100', '200', '300', '400', '500'].map((level) => (
                    <SelectItem key={level} value={level}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.level}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => setFormData({ ...formData, semester: value })}
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {['1', '2'].map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.semester && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.semester}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="course_code">Course Code *</Label>
            <Input
              id="course_code"
              placeholder="e.g., MATH101"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
            />
            {errors.course_code && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.course_code}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course Name *</Label>
            <Input
              id="course"
              placeholder="e.g., Mathematics 101"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            />
            {errors.course && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.course}
              </p>
            )}
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
                  ? 'Update Course'
                  : 'Create Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

