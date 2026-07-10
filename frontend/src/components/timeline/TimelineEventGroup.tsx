"use client";

import { EventCard } from "@/components/timeline/EventCard";
import {
  TimelineNode,
  TIMELINE_RAIL_RIGHT,
} from "@/components/timeline/TimelineNode";
import type { TimelineEvent } from "@/types/timeline";

type TimelineEventGroupProps = {
  title: string;
  tone: "enemy" | "government";
  events: TimelineEvent[];
  searchQuery: string;
  selectedEventId?: string | null;
  relatedLookup: (event: TimelineEvent) => {
    hasResponse: boolean;
    responseTimeMinutes?: number;
  };
  onOpen: (event: TimelineEvent) => void;
};

export function TimelineEventGroup({
  title,
  tone,
  events,
  searchQuery,
  selectedEventId,
  relatedLookup,
  onOpen,
}: TimelineEventGroupProps) {
  const isEnemy = tone === "enemy";
  const railPad = TIMELINE_RAIL_RIGHT * 2;

  return (
    <section>
      <div
        className="mb-2 flex items-center gap-2"
        style={{ direction: "rtl", paddingRight: railPad }}
      >
        <span
          className="inline-block rounded-full"
          style={{
            width: 7,
            height: 7,
            background: isEnemy ? "#EF3945" : "#4196FF",
          }}
        />
        <h4
          className="text-[15px] font-bold"
          style={{ color: isEnemy ? "#FF474D" : "#4196FF" }}
        >
          {title}
        </h4>
        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-400">
          {events.length.toLocaleString("fa-IR")}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {events.map((event) => {
          const related = relatedLookup(event);
          const size =
            event.severity === "critical" || event.severity === "high"
              ? "lg"
              : event.severity === "medium"
                ? "md"
                : "sm";
          const selected = selectedEventId === event.id;

          return (
            <div
              key={event.id}
              className="relative"
              style={{ paddingRight: railPad }}
            >
              <TimelineNode tone={tone} size={size} active={selected} />
              <EventCard
                event={event}
                searchQuery={searchQuery}
                selected={selected}
                hasResponse={related.hasResponse}
                responseTimeMinutes={related.responseTimeMinutes}
                onOpen={onOpen}
              />
            </div>
          );
        })}
        {events.length === 0 ? (
          <p
            className="text-xs text-slate-500"
            style={{ paddingRight: railPad }}
          >
            موردی در این بخش نیست.
          </p>
        ) : null}
      </div>
    </section>
  );
}
