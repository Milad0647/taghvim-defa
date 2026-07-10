"use client";

import { intensityColor } from "@/lib/timeline";
import type { TimelineDay } from "@/types/timeline";

type MonthlyViewProps = {
  days: TimelineDay[];
  onSelectDay: (date: string) => void;
};

export function MonthlyView({ days, onSelectDay }: MonthlyViewProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
      {days.slice(0, 28).map((day) => {
        const thumbs = day.events
          .map((e) => e.imageUrl)
          .filter(Boolean)
          .slice(0, 3) as string[];

        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDay(day.date)}
            className="min-h-[120px] rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-right transition hover:border-white/20"
            style={{
              boxShadow: `inset 0 0 0 1px ${intensityColor(day.intensity)}33`,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {day.persianDate.split(" ")[0]}
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] text-[var(--text-primary)]"
                style={{ backgroundColor: intensityColor(day.intensity) }}
              >
                {day.totalEvents.toLocaleString("fa-IR")}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-[var(--text-secondary)]">{day.weekday}</p>
            <div className="mt-2 flex gap-2 text-[10px]">
              <span className="text-red-300">
                د {day.enemyActionsCount.toLocaleString("fa-IR")}
              </span>
              <span className="text-blue-300">
                و {day.governmentActionsCount.toLocaleString("fa-IR")}
              </span>
            </div>
            {thumbs.length > 0 ? (
              <div className="mt-2 flex gap-1">
                {thumbs.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="h-6 w-6 rounded object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
