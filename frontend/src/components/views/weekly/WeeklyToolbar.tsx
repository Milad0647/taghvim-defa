"use client";

import { ViewSwitcher } from "@/components/timeline/ViewSwitcher";
import type { TimelineViewMode } from "@/types/timeline";
import { ChevronLeft, ChevronRight, Download, Filter, RefreshCw } from "lucide-react";

type WeeklyToolbarProps = {
  rangeLabel: string;
  selectedView: TimelineViewMode;
  onViewChange: (view: TimelineViewMode) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onOpenFilters: () => void;
  onRefresh?: () => void;
  activeFilterCount?: number;
};

export function WeeklyToolbar({
  rangeLabel,
  selectedView,
  onViewChange,
  onPrevWeek,
  onNextWeek,
  onOpenFilters,
  onRefresh,
  activeFilterCount = 0,
}: WeeklyToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs text-[var(--primary)] hover:bg-blue-500/20"
          >
            <Download className="h-3.5 w-3.5" />
            خروجی گزارش
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--hover)]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            تازه‌سازی
          </button>
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--hover)]"
          >
            <Filter className="h-3.5 w-3.5" />
            فیلترها
            {activeFilterCount > 0 ? (
              <span className="rounded-md bg-[var(--enemy)]/20 px-1.5 text-[10px] text-[var(--enemy)]">
                {activeFilterCount.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </button>
        </div>

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

        <ViewSwitcher value={selectedView} onChange={onViewChange} />
      </div>
    </div>
  );
}
