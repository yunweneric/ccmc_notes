import type {
  ClassSchedule,
  CreateClassSchedule,
  UpdateClassSchedule,
} from '../interfaces';

export class CalendarService {
  private schedules: ClassSchedule[] = [];

  private generateMockData(): ClassSchedule[] {
    const now = new Date();
    return [
      {
        id: '1',
        createdAt: now,
        updatedAt: now,
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:30',
        location: 'Room A101',
        lecturer: 'Dr. Smith',
      },
      {
        id: '2',
        createdAt: now,
        updatedAt: now,
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        day: 'Monday',
        startTime: '14:00',
        endTime: '15:30',
        location: 'Room B205',
        lecturer: 'Prof. Johnson',
      },
      {
        id: '3',
        createdAt: now,
        updatedAt: now,
        courseCode: 'PHYS101',
        courseName: 'Physics Fundamentals',
        day: 'Tuesday',
        startTime: '08:00',
        endTime: '09:30',
        location: 'Lab C301',
        lecturer: 'Dr. Williams',
      },
      {
        id: '4',
        createdAt: now,
        updatedAt: now,
        courseCode: 'CS201',
        courseName: 'Data Structures',
        day: 'Tuesday',
        startTime: '10:00',
        endTime: '11:30',
        location: 'Room A102',
        lecturer: 'Prof. Brown',
      },
      {
        id: '5',
        createdAt: now,
        updatedAt: now,
        courseCode: 'ENG101',
        courseName: 'English Composition',
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '10:30',
        location: 'Room D401',
        lecturer: 'Dr. Davis',
      },
      {
        id: '6',
        createdAt: now,
        updatedAt: now,
        courseCode: 'CHEM101',
        courseName: 'General Chemistry',
        day: 'Wednesday',
        startTime: '13:00',
        endTime: '14:30',
        location: 'Lab E201',
        lecturer: 'Prof. Miller',
      },
      {
        id: '7',
        createdAt: now,
        updatedAt: now,
        courseCode: 'CS301',
        courseName: 'Algorithms',
        day: 'Thursday',
        startTime: '09:00',
        endTime: '10:30',
        location: 'Room A103',
        lecturer: 'Dr. Wilson',
      },
      {
        id: '8',
        createdAt: now,
        updatedAt: now,
        courseCode: 'MATH301',
        courseName: 'Linear Algebra',
        day: 'Thursday',
        startTime: '11:00',
        endTime: '12:30',
        location: 'Room B206',
        lecturer: 'Prof. Moore',
      },
      {
        id: '9',
        createdAt: now,
        updatedAt: now,
        courseCode: 'PHYS201',
        courseName: 'Mechanics',
        day: 'Friday',
        startTime: '08:00',
        endTime: '09:30',
        location: 'Lab C302',
        lecturer: 'Dr. Taylor',
      },
      {
        id: '10',
        createdAt: now,
        updatedAt: now,
        courseCode: 'CS401',
        courseName: 'Database Systems',
        day: 'Friday',
        startTime: '10:00',
        endTime: '11:30',
        location: 'Room A104',
        lecturer: 'Prof. Anderson',
      },
      {
        id: '11',
        createdAt: now,
        updatedAt: now,
        courseCode: 'BIO101',
        courseName: 'Biology I',
        day: 'Monday',
        startTime: '11:00',
        endTime: '12:30',
        location: 'Lab F101',
        lecturer: 'Dr. Thomas',
      },
      {
        id: '12',
        createdAt: now,
        updatedAt: now,
        courseCode: 'HIST101',
        courseName: 'World History',
        day: 'Tuesday',
        startTime: '13:00',
        endTime: '14:30',
        location: 'Room G201',
        lecturer: 'Prof. Jackson',
      },
      {
        id: '13',
        createdAt: now,
        updatedAt: now,
        courseCode: 'CS202',
        courseName: 'Object-Oriented Programming',
        day: 'Wednesday',
        startTime: '11:00',
        endTime: '12:30',
        location: 'Room A105',
        lecturer: 'Dr. White',
      },
      {
        id: '14',
        createdAt: now,
        updatedAt: now,
        courseCode: 'STAT201',
        courseName: 'Statistics',
        day: 'Thursday',
        startTime: '14:00',
        endTime: '15:30',
        location: 'Room B207',
        lecturer: 'Prof. Harris',
      },
      {
        id: '15',
        createdAt: now,
        updatedAt: now,
        courseCode: 'ART101',
        courseName: 'Introduction to Art',
        day: 'Friday',
        startTime: '13:00',
        endTime: '14:30',
        location: 'Studio H301',
        lecturer: 'Dr. Martin',
      },
    ];
  }

  async list(): Promise<{ data: ClassSchedule[]; error: Error | null }> {
    try {
      // Load from localStorage if available
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('ccmc-calendar-schedules');
        if (stored) {
          this.schedules = JSON.parse(stored);
        } else {
          // If no stored data, initialize with mock data
          this.schedules = this.generateMockData();
          this.saveToStorage();
        }
      } else {
        // Server-side: return mock data
        this.schedules = this.generateMockData();
      }
      return { data: [...this.schedules], error: null };
    } catch (err) {
      return {
        data: [],
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async create(
    input: CreateClassSchedule
  ): Promise<{ data: ClassSchedule | null; error: Error | null }> {
    try {
      const now = new Date();
      const newSchedule: ClassSchedule = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      this.schedules.push(newSchedule);
      this.saveToStorage();
      return { data: newSchedule, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async update(
    input: UpdateClassSchedule
  ): Promise<{ data: ClassSchedule | null; error: Error | null }> {
    try {
      const index = this.schedules.findIndex((s) => s.id === input.id);
      if (index === -1) {
        return { data: null, error: new Error('Schedule not found') };
      }
      this.schedules[index] = { ...this.schedules[index], ...input };
      this.saveToStorage();
      return { data: this.schedules[index], error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const index = this.schedules.findIndex((s) => s.id === id);
      if (index === -1) {
        return { error: new Error('Schedule not found') };
      }
      this.schedules.splice(index, 1);
      this.saveToStorage();
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ccmc-calendar-schedules', JSON.stringify(this.schedules));
    }
  }
}

export const calendarService = new CalendarService();

