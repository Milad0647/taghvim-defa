"use client";

import { WeeklyDayCard } from "@/components/views/weekly/WeeklyDayCard";
import { WeeklyKpiCards } from "@/components/views/weekly/WeeklyKpiCards";
import { WeeklyLegend } from "@/components/views/weekly/WeeklyLegend";
import { WeeklyToolbar } from "@/components/views/weekly/WeeklyToolbar";
import {
  formatWeekRangeLabel,
  getWeekModels,
  shiftWeek,
  startOfWeekSaturday,
  summarizeWeek,
  toWeeklyDateString,
} from "@/lib/weekly";
import type { TimelineDay, TimelineViewMode } from "@/types/timeline";
import { useMemo, useState } from "react";

type WeeklyViewProps = {
  days: TimelineDay[];
  selectedDay?: string | null;
  selectedView: TimelineViewMode;
  onViewChange: (view: TimelineViewMode) => void;
  onSelectDay: (date: string) => void;
  onOpenFilters: () => void;
  activeFilterCount?: number;
};

export function WeeklyView({
  days,
  selectedDay = null,
  selectedView,
  onViewChange,
  onSelectDay,
  onOpenFilters,
  activeFilterCount = 0,
}: WeeklyViewProps) {
  const defaultAnchor =
    selectedDay ?? days[0]?.date ?? toWeeklyDateString(new Date());

  const [weekAnchor, setWeekAnchor] = useState(() =>
    toWeeklyDateString(startOfWeekSaturday(defaultAnchor)),
  );

  const models = useMemo(
    () => getWeekModels(days, weekAnchor),
    [days, weekAnchor],
  );

  const summary = useMemo(() => summarizeWeek(models), [models]);
  const rangeLabel = formatWeekRangeLabel(models);
  const activeDate =
    selectedDay && models.some((m) => m.day.date === selectedDay)
      ? selectedDay
      : models.reduce((best, m) =>
          m.day.totalEvents > (best?.day.totalEvents ?? -1) ? m : best,
          models[0],
        )?.day.date ?? null;

  return (
    <section className="space-y-3" style={{ direction: "rtl", textAlign: "right" }}>
      <WeeklyToolbar
        rangeLabel={rangeLabel || "بازه هفتگی"}
        selectedView={selectedView}
        onViewChange={onViewChange}
        onPrevWeek={() => setWeekAnchor((prev) => shiftWeek(prev, -1))}
        onNextWeek={() => setWeekAnchor((prev) => shiftWeek(prev, 1))}
        onOpenFilters={onOpenFilters}
        onRefresh={() => setWeekAnchor((prev) => prev)}
        activeFilterCount={activeFilterCount}
      />

      <WeeklyKpiCards
        totalEvents={summary.totalEvents}
        enemy={summary.enemy}
        government={summary.government}
        responseRatio={summary.responseRatio}
        avgResponseMinutes={summary.avgResponseMinutes}
      />

      {models.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center text-sm text-[var(--text-secondary)]">
          برای این هفته داده‌ای یافت نشد.
        </div>
      ) : (
        <>
          <div className="-mx-1 overflow-x-auto px-1 pb-1 xl:mx-0 xl:overflow-visible xl:px-0">
            <div className="grid min-w-[980px] grid-cols-7 gap-3.5 xl:min-w-0">
              {models.map((model) => (
                <WeeklyDayCard
                  key={model.day.date}
                  model={model}
                  selected={activeDate === model.day.date}
                  onSelect={onSelectDay}
                />
              ))}
            </div>
          </div>

          <WeeklyLegend />
        </>
      )}
    </section>
  );
}
