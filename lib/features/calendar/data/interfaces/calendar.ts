export interface ClassSchedule {
  id: string;
  courseCode: string;
  courseName: string;
  day: string; // "Monday", "Tuesday", etc. or day number (0-6)
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  location: string;
  lecturer?: string;
  week?: string; // Optional: for weekly timetables
}

export interface TimetableData {
  schedules: ClassSchedule[];
  currentWeek?: string;
}

export interface CreateClassSchedule {
  courseCode: string;
  courseName: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  lecturer?: string;
  week?: string;
}

export interface UpdateClassSchedule extends Partial<CreateClassSchedule> {
  id: string;
}

