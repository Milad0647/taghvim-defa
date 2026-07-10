"use client";

import { highlightText, severityLabel } from "@/lib/timeline";
import type { TimelineEvent } from "@/types/timeline";
import clsx from "clsx";
import { FileImage } from "lucide-react";

type EventCardProps = {
  event: TimelineEvent;
  searchQuery?: string;
  selected?: boolean;
  hasResponse?: boolean;
  responseTimeMinutes?: number;
  onOpen: (event: TimelineEvent) => void;
};

const STATUS_STYLES = {
  red: "linear-gradient(180deg, #D93643, #B91E30)",
  orange: "linear-gradient(180deg, #F47742, #D04C2D)",
  green: "linear-gradient(180deg, #32B894, #16836E)",
  blue: "linear-gradient(180deg, #408CE9, #2266C3)",
} as const;

function statusStyle(event: TimelineEvent): {
  label: string;
  color: keyof typeof STATUS_STYLES;
} {
  if (event.eventType === "enemy") {
    if (event.severity === "critical" || event.severity === "high") {
      return { label: severityLabel(event.severity), color: "red" };
    }
    if (event.severity === "medium") {
      return { label: severityLabel(event.severity), color: "orange" };
    }
    return { label: severityLabel(event.severity), color: "orange" };
  }

  if (event.actionStatus === "successful") {
    return { label: "موفق", color: "green" };
  }
  if (event.actionStatus === "completed") {
    return { label: "انجام‌شده", color: "blue" };
  }
  if (event.actionStatus === "in_progress") {
    return { label: "در حال اجرا", color: "blue" };
  }
  return { label: "اطلاع‌رسانی", color: "blue" };
}

export function EventCard({
  event,
  searchQuery = "",
  selected = false,
  onOpen,
}: EventCardProps) {
  const isEnemy = event.eventType === "enemy";
  const status = statusStyle(event);
  const tags = (event.tags ?? []).slice(0, 2);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(event)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen(event);
      }}
      className={clsx(
        "relative min-h-[113px] cursor-pointer overflow-hidden rounded-[11px] p-2 outline-none transition duration-200 hover:-translate-y-0.5",
      )}
      style={{
        direction: "ltr",
        background: isEnemy
          ? "linear-gradient(90deg, rgba(46, 16, 27, 0.92) 0%, rgba(37, 15, 28, 0.92) 55%, rgba(28, 17, 29, 0.92) 100%)"
          : "linear-gradient(90deg, rgba(13, 36, 67, 0.95) 0%, rgba(12, 31, 58, 0.95) 55%, rgba(10, 25, 47, 0.95) 100%)",
        border: selected
          ? isEnemy
            ? "1px solid rgba(255, 90, 98, 0.85)"
            : "1px solid rgba(85, 161, 255, 0.85)"
          : isEnemy
            ? "1px solid rgba(210, 48, 59, 0.58)"
            : "1px solid rgba(46, 116, 210, 0.62)",
        boxShadow: selected
          ? isEnemy
            ? "0 0 18px rgba(239, 68, 68, 0.22), inset 0 0 24px rgba(185, 28, 47, 0.05)"
            : "0 0 18px rgba(59, 130, 246, 0.22)"
          : isEnemy
            ? "inset 0 0 24px rgba(185, 28, 47, 0.05)"
            : "none",
      }}
    >
      <div
        className="grid h-full items-stretch gap-2.5"
        style={{ gridTemplateColumns: "190px minmax(0, 1fr)" }}
      >
        <div className="relative h-[96px] w-[190px] shrink-0 self-center overflow-hidden rounded-[9px] bg-[#0D1A30]">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-600">
              <FileImage className="h-5 w-5" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/35" />
          <span
            className="absolute top-1.5 left-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium text-white"
            style={{
              background: STATUS_STYLES[status.color],
              boxShadow:
                status.color === "red"
                  ? "0 2px 10px rgba(215, 40, 56, 0.32)"
                  : "none",
            }}
          >
            {status.label}
          </span>
          <div
            className="pointer-events-none absolute inset-0 rounded-[9px]"
            style={{
              border: isEnemy
                ? "1px solid rgba(239, 68, 68, 0.58)"
                : "1px solid rgba(59, 130, 246, 0.45)",
            }}
          />
        </div>

        <div
          className="min-w-0 self-center py-0.5 pe-1"
          style={{ direction: "rtl", textAlign: "right" }}
        >
          <div className="mb-[7px] flex items-start justify-between gap-2">
            <h3
              className="min-w-0 flex-1 text-[15px] font-bold leading-snug"
              style={{ color: "#F5F2F4" }}
              dangerouslySetInnerHTML={{
                __html: highlightText(event.title, searchQuery),
              }}
            />
            <span
              className="shrink-0 pt-0.5 text-[12px] tabular-nums"
              style={{ color: isEnemy ? "#FF6166" : "#55A1FF" }}
            >
              {event.time}
            </span>
          </div>
          <p
            className="line-clamp-2 text-[11px] leading-[1.85]"
            style={{ color: "#BEB4BA" }}
            dangerouslySetInnerHTML={{
              __html: highlightText(event.summary, searchQuery),
            }}
          />
          {tags.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-[10px]"
                  style={{
                    background: "transparent",
                    border: isEnemy
                      ? "1px solid rgba(229, 53, 65, 0.55)"
                      : "1px solid rgba(47, 124, 228, 0.65)",
                    color: isEnemy ? "#FF5961" : "#55A1FF",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
