import type {
  ClassSchedule,
  CreateClassSchedule,
  UpdateClassSchedule,
} from '../interfaces';

export class CalendarService {
  private schedules: ClassSchedule[] = [];

  async list(): Promise<{ data: ClassSchedule[]; error: Error | null }> {
    try {
      // Load from localStorage if available
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('ccmc-calendar-schedules');
        if (stored) {
          this.schedules = JSON.parse(stored);
        }
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
      const newSchedule: ClassSchedule = {
        id: crypto.randomUUID(),
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

