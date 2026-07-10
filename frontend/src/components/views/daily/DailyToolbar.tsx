"use client";

import { emptyTimelineDay } from "@/lib/monthly";
import type { TimelineDay } from "@/types/timeline";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

type DailyToolbarProps = {
  day: TimelineDay;
  onPrevDay: () => void;
  onNextDay: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  dayOptions?: TimelineDay[];
  onPickDay?: (date: string) => void;
};

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftCalendarDay(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return toDateString(d);
}

export function resolveDay(
  days: TimelineDay[],
  date: string | null | undefined,
): TimelineDay {
  const key =
    date ?? days[0]?.date ?? toDateString(new Date());
  return days.find((d) => d.date === key) ?? emptyTimelineDay(key);
}

export function DailyToolbar({
  day,
  onPrevDay,
  onNextDay,
  canGoPrev = true,
  canGoNext = true,
  dayOptions = [],
  onPickDay,
}: DailyToolbarProps) {
  const chips = useMemo(() => {
    if (dayOptions.length === 0) return [];
    const idx = dayOptions.findIndex((d) => d.date === day.date);
    if (idx < 0) return dayOptions.slice(0, 7);
    const start = Math.max(0, idx - 3);
    return dayOptions.slice(start, start + 7);
  }, [day.date, dayOptions]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-4">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onNextDay}
          disabled={!canGoNext}
          className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-2 text-[var(--text-secondary)] hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="روز بعد"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="min-w-[220px] rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-center sm:min-w-[280px]">
          <p className="m-0 text-sm font-semibold text-[var(--text-primary)]">
            {day.weekday}
          </p>
          <p className="m-0 mt-0.5 text-xs text-[var(--text-secondary)]">
            {day.persianDate}
          </p>
        </div>
        <button
          type="button"
          onClick={onPrevDay}
          disabled={!canGoPrev}
          className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-2 text-[var(--text-secondary)] hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="روز قبل"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {chips.length > 0 && onPickDay ? (
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel-2)] p-1 scrollbar-thin">
          {chips.map((option) => {
            const selected = option.date === day.date;
            const label = option.persianDate.split(" ").slice(0, 2).join(" ");
            return (
              <button
                key={option.date}
                type="button"
                onClick={() => onPickDay(option.date)}
                className={
                  selected
                    ? "shrink-0 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-md shadow-blue-600/25"
                    : "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]"
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
