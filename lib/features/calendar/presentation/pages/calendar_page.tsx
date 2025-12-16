'use client';

import { CalendarPreview } from '../components/calendar_preview';

export function CalendarPage() {
  return (
    <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-950">
      <CalendarPreview />
    </div>
  );
}

