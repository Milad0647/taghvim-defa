"use client";

import { WeeklyCalendarPopover } from "@/components/views/weekly/WeeklyCalendarPopover";
import { WeeklyWeekSelector } from "@/components/views/weekly/WeeklyWeekSelector";
import type { WeekOption } from "@/lib/weekly";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type WeeklyToolbarProps = {
  rangeLabel: string;
  weeks: WeekOption[];
  activeWeekStart: string;
  onSelectWeek: (startDate: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onRefresh?: () => void;
};

export function WeeklyToolbar({
  rangeLabel,
  weeks,
  activeWeekStart,
  onSelectWeek,
  onPrevWeek,
  onNextWeek,
  onRefresh,
}: WeeklyToolbarProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calendarOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCalendarOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [calendarOpen]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--hover)]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          تازه‌سازی
        </button>

        <div
          ref={pickerRef}
          className="relative flex items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={onNextWeek}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-2 text-[var(--text-secondary)] hover:bg-[var(--hover)]"
            aria-label="هفته بعد"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setCalendarOpen((v) => !v)}
            aria-expanded={calendarOpen}
            aria-haspopup="dialog"
            aria-label="باز کردن تقویم انتخاب هفته"
            title="برای انتخاب هفته کلیک کنید"
            className={clsx(
              "min-w-[220px] rounded-xl border px-3 py-2 text-center text-xs font-medium transition sm:min-w-[280px] sm:text-sm",
              calendarOpen
                ? "border-[var(--primary)]/50 bg-[var(--primary)]/10 text-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--panel-2)] text-[var(--text-primary)] hover:border-[var(--primary)]/35 hover:bg-[var(--hover)]",
            )}
          >
            {rangeLabel}
          </button>

          <button
            type="button"
            onClick={onPrevWeek}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-2 text-[var(--text-secondary)] hover:bg-[var(--hover)]"
            aria-label="هفته قبل"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {calendarOpen ? (
            <WeeklyCalendarPopover
              weeks={weeks}
              activeStartDate={activeWeekStart}
              onSelectWeek={onSelectWeek}
              onClose={() => setCalendarOpen(false)}
            />
          ) : null}
        </div>
      </div>

      <WeeklyWeekSelector
        weeks={weeks}
        activeStartDate={activeWeekStart}
        onSelectWeek={onSelectWeek}
      />
    </div>
  );
}
