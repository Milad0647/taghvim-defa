"use client";

import { TimelineEventGroup } from "@/components/timeline/TimelineEventGroup";
import { TIMELINE_RAIL_RIGHT } from "@/components/timeline/TimelineNode";
import type { TimelineDay, TimelineEvent } from "@/types/timeline";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

type TimelineDaySectionProps = {
  day: TimelineDay;
  collapsed: boolean;
  isActive: boolean;
  searchQuery: string;
  selectedEventId?: string | null;
  showEnemy?: boolean;
  showGovernment?: boolean;
  relatedLookup: (event: TimelineEvent) => {
    hasResponse: boolean;
    responseTimeMinutes?: number;
  };
  onToggle: (date: string) => void;
  onOpenEvent: (event: TimelineEvent) => void;
};

export function TimelineDaySection({
  day,
  collapsed,
  isActive,
  searchQuery,
  selectedEventId,
  showEnemy = true,
  showGovernment = true,
  relatedLookup,
  onToggle,
  onOpenEvent,
}: TimelineDaySectionProps) {
  const enemyEvents = day.events.filter((e) => e.eventType === "enemy");
  const govEvents = day.events.filter((e) => e.eventType === "government");

  return (
    <section
      id={`day-${day.date}`}
      className={clsx(
        "scroll-mt-36 rounded-2xl border transition",
        isActive ? "border-blue-500/35" : "border-[var(--border)]",
        day.isCritical && "ring-1 ring-red-500/20",
      )}
      style={{ background: "#07101F" }}
    >
      <button
        type="button"
        onClick={() => onToggle(day.date)}
        className="sticky top-[148px] z-20 flex h-[38px] w-full items-center justify-between gap-3 rounded-t-2xl border-b border-[var(--border)] px-3 text-right backdrop-blur"
        style={{ background: "rgba(7, 16, 31, 0.95)" }}
        aria-expanded={!collapsed}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className="text-[18px] font-bold leading-[1.6]"
            style={{ color: "#E8EDF5" }}
          >
            {day.weekday}، {day.persianDate}
          </h3>
          <span
            className="rounded-[10px] px-2.5 py-1 text-[11px]"
            style={{
              background: "#0B1527",
              border: "1px solid #17243B",
              color: "#D4DAE5",
            }}
          >
            {day.totalEvents.toLocaleString("fa-IR")} رویداد
          </span>
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">
            {day.enemyActionsCount.toLocaleString("fa-IR")} دشمن
          </span>
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300">
            {day.governmentActionsCount.toLocaleString("fa-IR")} دولت
          </span>
        </div>
        <ChevronDown
          className={clsx(
            "h-5 w-5 shrink-0 text-slate-400 transition",
            !collapsed && "rotate-180",
          )}
        />
      </button>

      {!collapsed ? (
        <div className="relative space-y-5 py-3 pl-3">
          <div
            className="pointer-events-none absolute bottom-6 top-6 z-[1] w-px"
            style={{
              right: TIMELINE_RAIL_RIGHT,
              transform: "translateX(50%)",
              background:
                "linear-gradient(180deg, rgba(56, 74, 105, 0.45), rgba(83, 105, 140, 0.7), rgba(56, 74, 105, 0.45))",
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
      ) : null}
    </section>
  );
}
