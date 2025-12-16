'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useTranslation } from '@/lib/features/i18n';
import type { ClassSchedule, CreateClassSchedule, UpdateClassSchedule } from '../../data/interfaces';

interface TimetableFormProps {
  schedule?: ClassSchedule;
  selectedDate?: Date;
  selectedTime?: string;
  onSubmit: (data: CreateClassSchedule | UpdateClassSchedule) => void;
  onCancel: () => void;
}

const DAYS = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
];

export function TimetableForm({
  schedule,
  selectedDate,
  selectedTime,
  onSubmit,
  onCancel,
}: TimetableFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    courseCode: schedule?.courseCode || '',
    courseName: schedule?.courseName || '',
    day: schedule?.day || '',
    startTime: schedule?.startTime || '',
    endTime: schedule?.endTime || '',
    location: schedule?.location || '',
    lecturer: schedule?.lecturer || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Pre-fill day from selected date
    if (selectedDate && !schedule) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[selectedDate.getDay()];
      setFormData(prev => ({ ...prev, day: dayName }));
    }

    // Pre-fill time from selected time slot
    if (selectedTime && !schedule) {
      setFormData(prev => ({ ...prev, startTime: selectedTime }));
      // Set end time to 1.5 hours later
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const endHours = hours + 1;
      const endMinutes = minutes + 30;
      const finalHours = endMinutes >= 60 ? endHours + 1 : endHours;
      const finalMinutes = endMinutes >= 60 ? endMinutes - 60 : endMinutes;
      const endTime = `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, endTime }));
    }
  }, [selectedDate, selectedTime, schedule]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = t('timetable.courseCode') + ' is required';
    }

    if (!formData.courseName.trim()) {
      newErrors.courseName = t('timetable.courseName') + ' is required';
    }

    if (!formData.day) {
      newErrors.day = t('timetable.day') + ' is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = t('timetable.startTime') + ' is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = t('timetable.endTime') + ' is required';
    }

    if (formData.startTime && formData.endTime) {
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;

      if (endTotal <= startTotal) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = t('timetable.location') + ' is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    if (schedule) {
      onSubmit({
        id: schedule.id,
        ...formData,
      } as UpdateClassSchedule);
    } else {
      onSubmit(formData as CreateClassSchedule);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="courseCode" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t('timetable.courseCode')}
        </label>
        <Input
          id="courseCode"
          value={formData.courseCode}
          onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
          className={errors.courseCode ? 'border-red-500' : ''}
        />
        {errors.courseCode && (
          <p className="text-xs text-red-500">{errors.courseCode}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="courseName" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t('timetable.courseName')}
        </label>
        <Input
          id="courseName"
          value={formData.courseName}
          onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
          className={errors.courseName ? 'border-red-500' : ''}
        />
        {errors.courseName && (
          <p className="text-xs text-red-500">{errors.courseName}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="day" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t('timetable.day')}
        </label>
        <Select
          value={formData.day}
          onValueChange={(value) => setFormData(prev => ({ ...prev, day: value }))}
        >
          <SelectTrigger className={errors.day ? 'border-red-500' : ''}>
            <SelectValue placeholder={`Select ${t('timetable.day').toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.day && (
          <p className="text-xs text-red-500">{errors.day}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startTime" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t('timetable.startTime')}
          </label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            className={errors.startTime ? 'border-red-500' : ''}
          />
          {errors.startTime && (
            <p className="text-xs text-red-500">{errors.startTime}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="endTime" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t('timetable.endTime')}
          </label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            className={errors.endTime ? 'border-red-500' : ''}
          />
          {errors.endTime && (
            <p className="text-xs text-red-500">{errors.endTime}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t('timetable.location')}
        </label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className={errors.location ? 'border-red-500' : ''}
        />
        {errors.location && (
          <p className="text-xs text-red-500">{errors.location}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="lecturer" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t('timetable.lecturer')}
        </label>
        <Input
          id="lecturer"
          value={formData.lecturer}
          onChange={(e) => setFormData(prev => ({ ...prev, lecturer: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {t('timetable.cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          {t('timetable.save')}
        </button>
      </div>
    </form>
  );
}

