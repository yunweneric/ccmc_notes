import { z } from "zod";

// Schema for course validation (for future forms if needed)
export const courseSchema = z.object({
  level: z.string().min(1, "Level is required"),
  semester: z.string().min(1, "Semester is required"),
  course: z.string().min(1, "Course name is required"),
  course_code: z.string().min(1, "Course code is required"),
});

export type CourseFormData = z.infer<typeof courseSchema>;

