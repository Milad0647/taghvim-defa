"use client";

import { intensityColor, intensityLabel } from "@/lib/timeline";
import type { TimelineDay } from "@/types/timeline";

type WeeklyViewProps = {
  days: TimelineDay[];
  onSelectDay: (date: string) => void;
};

export function WeeklyView({ days, onSelectDay }: WeeklyViewProps) {
  const week = days.slice(0, 7);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
      {week.map((day) => {
        const max = Math.max(1, ...week.map((d) => d.totalEvents));
        const height = Math.round((day.totalEvents / max) * 100);
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDay(day.date)}
            className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] p-3 text-right transition hover:border-[var(--purple)]/40"
          >
            <p className="text-xs text-[var(--text-secondary)]">{day.weekday}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{day.persianDate}</p>
            <div className="mt-3 h-16 overflow-hidden rounded-lg bg-[var(--surface-3)]">
              <div
                className="mx-auto w-6 rounded-t-md"
                style={{
                  height: `${height}%`,
                  marginTop: `${100 - height}%`,
                  backgroundColor: intensityColor(day.intensity),
                }}
              />
            </div>
            <div className="mt-3 space-y-1 text-[11px] text-[var(--text-secondary)]">
              <p className="text-red-300">
                دشمن: {day.enemyActionsCount.toLocaleString("fa-IR")}
              </p>
              <p className="text-blue-300">
                دولت: {day.governmentActionsCount.toLocaleString("fa-IR")}
              </p>
              <p>شدت: {intensityLabel(day.intensity)}</p>
            </div>
            {day.events[0] ? (
              <p className="mt-2 line-clamp-2 text-[11px] text-[var(--text-secondary)]">
                {day.events[0].title}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
