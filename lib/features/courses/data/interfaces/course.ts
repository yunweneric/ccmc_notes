export type RawNote = {
  title: string;
  description: string;
  lecturer_name: string;
  added_date: string;
  file_url: string;
};

export type CourseGroup = {
  level: string;
  semester: string;
  course: string;
  course_code: string;
  notes: RawNote[];
};

export type SelectedNote = RawNote & {
  level: string;
  semester: string;
  course: string;
  course_code: string;
};

export type RecentCourse = {
  level: string;
  semester: string;
  course: string;
  course_code: string;
  latestNoteTitle: string;
  latestAddedDate: string;
  note: RawNote;
};


