"use client";

import { TimelineEventGroup } from "@/components/timeline/TimelineEventGroup";
import { TIMELINE_RAIL_RIGHT } from "@/components/timeline/TimelineNode";
import { intensityColor, intensityLabel } from "@/lib/timeline";
import type { TimelineDay, TimelineEvent } from "@/types/timeline";

type DayFullViewProps = {
  day: TimelineDay;
  searchQuery?: string;
  selectedEventId?: string | null;
  showEnemy?: boolean;
  showGovernment?: boolean;
  relatedLookup: (event: TimelineEvent) => {
    hasResponse: boolean;
    responseTimeMinutes?: number;
  };
  onOpenEvent: (event: TimelineEvent) => void;
};

export function DayFullView({
  day,
  searchQuery = "",
  selectedEventId = null,
  showEnemy = true,
  showGovernment = true,
  relatedLookup,
  onOpenEvent,
}: DayFullViewProps) {
  const enemyEvents = day.events.filter((e) => e.eventType === "enemy");
  const govEvents = day.events.filter((e) => e.eventType === "government");
  const hasEvents = day.totalEvents > 0;
  const tone = intensityColor(day.intensity);

  return (
    <section
      className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]"
      style={{ direction: "rtl", textAlign: "right" }}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-3 sm:px-4">
        <div className="min-w-0 space-y-1">
          <h2 className="m-0 text-lg font-bold text-[var(--text-primary)] sm:text-xl">
            {day.weekday}، {day.persianDate}
          </h2>
          <p className="m-0 text-xs text-[var(--text-secondary)]">
            نمای کامل رویدادها و اقدامات این روز
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
            {day.totalEvents.toLocaleString("fa-IR")} رویداد
          </span>
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-[var(--enemy)]">
            {day.enemyActionsCount.toLocaleString("fa-IR")} دشمن
          </span>
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-[var(--government)]">
            {day.governmentActionsCount.toLocaleString("fa-IR")} دولت
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: tone }}
          >
            {intensityLabel(day.intensity)}
          </span>
        </div>
      </header>

      {!hasEvents ? (
        <div className="px-4 py-12 text-center text-sm text-[var(--text-secondary)]">
          برای این روز رویدادی ثبت نشده است.
        </div>
      ) : (
        <div className="relative space-y-5 py-3 pl-3">
          <div
            className="pointer-events-none absolute bottom-6 top-6 z-[1] w-px bg-[var(--border)]"
            style={{
              right: TIMELINE_RAIL_RIGHT,
              transform: "translateX(50%)",
            }}
          />

          {showEnemy ? (
            <TimelineEventGroup
              title="اقدامات دشمن"
              tone="enemy"
              events={enemyEvents}
              searchQuery={searchQuery}
              selectedEventId={selectedEventId}
              relatedLookup={relatedLookup}
              onOpen={onOpenEvent}
            />
          ) : null}

          {showGovernment ? (
            <TimelineEventGroup
              title="اقدامات دولت"
              tone="government"
              events={govEvents}
              searchQuery={searchQuery}
              selectedEventId={selectedEventId}
              relatedLookup={relatedLookup}
              onOpen={onOpenEvent}
            />
          ) : null}
        </div>
      )}
    </section>
  );
}
