import type { BaseEntity } from '@/lib/shared/interfaces/base';

export type Note = BaseEntity & {
  title: string;
  description: string;
  lecturer_name?: string;
  added_date: string; // Legacy field, maps to createdAt for backward compatibility
  updated_date?: string; // Legacy field, maps to updatedAt for backward compatibility
  created_by?: string; // admin user email/uid
  tags?: string[];
  file_url: string;
  file_size?: number; // in bytes
  file_type?: string; // e.g., "application/pdf"
  course_id: string; // reference to course: `${level}-${semester}-${course_code}`
};

// Legacy type for backward compatibility with existing RawNote
export type RawNote = {
  title: string;
  description: string;
  lecturer_name: string;
  added_date: string;
  file_url: string;
};

