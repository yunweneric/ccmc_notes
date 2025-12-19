import { z } from 'zod';

export const noteSchema = z.object({
  course_id: z.string().min(1, 'Course is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  lecturer_name: z.string().min(1, 'Lecturer name is required'),
  file_url: z.string().url('File URL must be a valid URL'),
  tags: z.array(z.string()).optional(),
  file_size: z.number().positive().optional(),
  file_type: z.string().optional(),
});

export type NoteFormData = z.infer<typeof noteSchema>;

