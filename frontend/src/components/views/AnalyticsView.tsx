"use client";

import { computeSummary, getAllEvents } from "@/data/timeline.mock";
import { formatResponseTime, intensityColor } from "@/lib/timeline";
import type { TimelineDay } from "@/types/timeline";

type AnalyticsViewProps = {
  days: TimelineDay[];
};

export function AnalyticsView({ days }: AnalyticsViewProps) {
  const summary = computeSummary(days);
  const events = getAllEvents(days);

  const categories = new Map<string, number>();
  const provinces = new Map<string, number>();
  const orgs = new Map<string, number>();

  events.forEach((event) => {
    categories.set(event.category, (categories.get(event.category) || 0) + 1);
    if (event.location?.province) {
      provinces.set(
        event.location.province,
        (provinces.get(event.location.province) || 0) + 1,
      );
    }
    if (event.organization) {
      orgs.set(event.organization, (orgs.get(event.organization) || 0) + 1);
    }
  });

  const unanswered = events.filter(
    (e) =>
      e.eventType === "enemy" &&
      (!e.relatedResponseIds || e.relatedResponseIds.length === 0),
  ).length;

  const top = (map: Map<string, number>) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="نرخ پاسخ" value={`${summary.responseRatio.toLocaleString("fa-IR")}٪`} />
        <Stat
          title="میانگین واکنش"
          value={formatResponseTime(summary.avgResponseMinutes) || "—"}
        />
        <Stat title="بدون پاسخ" value={unanswered.toLocaleString("fa-IR")} />
        <Stat
          title="روزهای بحرانی"
          value={summary.criticalDays.toLocaleString("fa-IR")}
        />
      </div>

      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">روند روزانه</h3>
        <div className="flex h-40 items-end gap-1 overflow-x-auto">
          {[...days].reverse().map((day) => (
            <div key={day.date} className="flex min-w-[10px] flex-1 flex-col items-center">
              <div
                className="w-full rounded-t"
                style={{
                  height: `${Math.max(8, day.intensity)}%`,
                  backgroundColor: intensityColor(day.intensity),
                }}
                title={day.persianDate}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Rank title="پرتکرارترین دسته‌بندی" rows={top(categories)} />
        <Rank title="پرتکرارترین استان" rows={top(provinces)} />
        <Rank title="نهادهای فعال‌تر" rows={top(orgs)} />
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <p className="text-xs text-[var(--text-secondary)]">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function Rank({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      <div className="space-y-2">
        {rows.map(([name, count]) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{name}</span>
            <span className="text-slate-400">{count.toLocaleString("fa-IR")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
