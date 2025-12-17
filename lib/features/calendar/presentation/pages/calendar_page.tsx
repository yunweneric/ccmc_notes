'use client';

import { CalendarPreview } from '../components/calendar_preview';
import { useAuthContext } from '@/lib/features/auth';
import { Role } from '@/lib/features/auth/data/interfaces/auth';

export function CalendarPage() {
  const { user } = useAuthContext();
  const canEdit = user?.role?.name === Role.ADMIN;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <CalendarPreview canEdit={canEdit} />
    </div>
  );
}

