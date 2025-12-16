'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TimetableForm } from './timetable_form';
import { useTranslation } from '@/lib/features/i18n';
import type { ClassSchedule, CreateClassSchedule, UpdateClassSchedule } from '../../data/interfaces';
import { Trash2 } from 'lucide-react';

interface TimetableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  selectedTime?: string;
  schedule?: ClassSchedule;
  onSave: (schedule: CreateClassSchedule | UpdateClassSchedule) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function TimetableModal({
  open,
  onOpenChange,
  selectedDate,
  selectedTime,
  schedule,
  onSave,
  onDelete,
}: TimetableModalProps) {
  const { t } = useTranslation();
  const isEditMode = !!schedule;

  const handleSave = async (data: CreateClassSchedule | UpdateClassSchedule) => {
    await onSave(data);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (schedule && onDelete) {
      if (confirm(t('timetable.confirmDelete'))) {
        await onDelete(schedule.id);
        onOpenChange(false);
      }
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('timetable.editSchedule') : t('timetable.addSchedule')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the course schedule information.'
              : 'Add a new course schedule to the calendar.'}
          </DialogDescription>
        </DialogHeader>

        <TimetableForm
          schedule={schedule}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSubmit={handleSave}
          onCancel={handleCancel}
        />

        {isEditMode && onDelete && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-300 dark:border-red-800"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('timetable.deleteSchedule')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

