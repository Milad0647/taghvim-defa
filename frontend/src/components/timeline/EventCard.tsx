"use client";

import { highlightText, severityLabel } from "@/lib/timeline";
import { hasNationalHeroTag, NATIONAL_HERO_TAG } from "@/lib/tags";
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
  const isNationalHero = !isEnemy && hasNationalHeroTag(event.tags);
  const tags = (event.tags ?? []).slice(0, isNationalHero ? 3 : 2);

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
          ? "var(--event-enemy-bg)"
          : "var(--event-gov-bg)",
        border: selected
          ? isEnemy
            ? "1px solid var(--enemy-border)"
            : "1px solid var(--government-border)"
          : isEnemy
            ? "1px solid var(--enemy-border)"
            : "1px solid var(--government-border)",
        boxShadow: selected
          ? isEnemy
            ? "0 0 18px rgba(239, 68, 68, 0.22)"
            : "0 0 18px rgba(59, 130, 246, 0.22)"
          : "none",
      }}
    >
      <div className="grid h-full grid-cols-1 items-stretch gap-2.5 sm:grid-cols-[minmax(120px,190px)_minmax(0,1fr)]">
        <div className="relative h-[140px] w-full shrink-0 self-center overflow-hidden rounded-[9px] bg-[var(--panel-2)] sm:h-[96px] sm:max-w-[190px]">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
              <FileImage className="h-5 w-5" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/35" />
          <span
            className="absolute top-1.5 left-1.5 rounded-lg px-2.5 py-1 text-[10px] font-medium text-white"
            style={{
              background: isNationalHero
                ? "linear-gradient(180deg, #C9A227, #8B6914)"
                : STATUS_STYLES[status.color],
              boxShadow:
                status.color === "red"
                  ? "0 2px 10px rgba(215, 40, 56, 0.32)"
                  : "none",
            }}
          >
            {isNationalHero ? NATIONAL_HERO_TAG : status.label}
          </span>
          <div
            className="pointer-events-none absolute inset-0 rounded-[9px]"
            style={{
              border: isEnemy
                ? "1px solid var(--enemy-border)"
                : "1px solid var(--government-border)",
            }}
          />
        </div>

        <div
          className="min-w-0 self-center py-0.5 pe-1"
          style={{ direction: "rtl", textAlign: "right" }}
        >
          <div className="mb-[7px] flex items-start justify-between gap-2">
            <h3
              className="min-w-0 flex-1 text-[14px] font-bold leading-snug text-[var(--event-card-title)] sm:text-[15px]"
              dangerouslySetInnerHTML={{
                __html: highlightText(event.title, searchQuery),
              }}
            />
            <span
              className="shrink-0 pt-0.5 text-[12px] tabular-nums"
              style={{ color: isEnemy ? "var(--enemy)" : "var(--government)" }}
            >
              {event.time}
            </span>
          </div>
          <p
            className="line-clamp-2 text-[11px] leading-[1.85] text-[var(--event-card-body)]"
            dangerouslySetInnerHTML={{
              __html: highlightText(event.summary, searchQuery),
            }}
          />
          {tags.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const hero = tag === NATIONAL_HERO_TAG;
                return (
                  <span
                    key={tag}
                    className="rounded-full px-3 py-1 text-[10px] font-medium"
                    style={{
                      background: hero
                        ? "rgba(201, 162, 39, 0.18)"
                        : "transparent",
                      border: hero
                        ? "1px solid rgba(201, 162, 39, 0.7)"
                        : isEnemy
                          ? "1px solid var(--enemy-border)"
                          : "1px solid var(--government-border)",
                      color: hero
                        ? "#C9A227"
                        : isEnemy
                          ? "var(--enemy)"
                          : "var(--government)",
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
