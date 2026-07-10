"use client";

import { WeeklyWeekSelector } from "@/components/views/weekly/WeeklyWeekSelector";
import type { WeekOption } from "@/lib/weekly";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

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

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onNextWeek}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-2 text-[var(--text-secondary)] hover:bg-[var(--hover)]"
            aria-label="هفته بعد"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="min-w-[220px] rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-center text-xs font-medium text-[var(--text-primary)] sm:min-w-[280px] sm:text-sm">
            {rangeLabel}
          </div>
          <button
            type="button"
            onClick={onPrevWeek}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-2 text-[var(--text-secondary)] hover:bg-[var(--hover)]"
            aria-label="هفته قبل"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
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
