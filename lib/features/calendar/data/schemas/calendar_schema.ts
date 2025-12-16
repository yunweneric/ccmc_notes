import { z } from "zod";

export const createClassScheduleSchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  courseName: z.string().min(1, "Course name is required"),
  day: z.string().min(1, "Day is required"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  location: z.string().min(1, "Location is required"),
  lecturer: z.string().optional(),
  week: z.string().optional(),
});

export type CreateClassScheduleFormData = z.infer<typeof createClassScheduleSchema>;

