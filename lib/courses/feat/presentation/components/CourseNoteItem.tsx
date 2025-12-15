'use client';

import type { RawNote } from '../../data/interfaces/course';

type CourseNoteItemProps = {
  note: RawNote;
  level: string;
  semester: string;
  course: string;
  onOpen: () => void;
};

export function CourseNoteItem({
  note,
  level,
  semester,
  course,
  onOpen,
}: CourseNoteItemProps) {
  const addedDate = new Date(note.added_date);
  const formattedDate = Number.isNaN(addedDate.getTime())
    ? note.added_date
    : addedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const handleClick = () => {
    onOpen();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLLIElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <li
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="flex cursor-pointer flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900">
            {note.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-zinc-600">
            {note.description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
          Open
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
          Level {level}
        </span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          Semester {semester}
        </span>
        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
          {course}
        </span>
        <span className="ml-auto text-[11px] text-zinc-500">
          {note.lecturer_name} • {formattedDate}
        </span>
      </div>
    </li>
  );
}


