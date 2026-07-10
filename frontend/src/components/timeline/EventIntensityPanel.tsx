"use client";

import { intensityLabel } from "@/lib/timeline";
import type { TimelineDay } from "@/types/timeline";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";

const LEGEND_COLORS = [
  "#315B9A",
  "#4477C0",
  "#6D75AE",
  "#D46B66",
  "#F0774D",
  "#D93445",
] as const;

function pickColor(normalized: number): string {
  if (normalized < 0.18) return "#193D78";
  if (normalized < 0.28) return "#224C8D";
  if (normalized < 0.38) return "#315C9F";
  if (normalized < 0.48) return "#695779";
  if (normalized < 0.58) return "#985268";
  if (normalized < 0.68) return "#C45257";
  if (normalized < 0.78) return "#E05243";
  if (normalized < 0.88) return "#F15A45";
  if (normalized < 0.94) return "#D82E43";
  return "#B8233C";
}

function shortPersianLabel(day: TimelineDay): string {
  // e.g. "۱۳ تیر ۱۴۰۵" → "۱۳ تیر"
  const parts = day.persianDate.split(" ");
  if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
  return day.persianDate;
}

type EventIntensityPanelProps = {
  days: TimelineDay[];
  activeDate?: string | null;
  onSelectDay?: (date: string) => void;
  className?: string;
};

export function EventIntensityPanel({
  days,
  activeDate = null,
  onSelectDay,
  className,
}: EventIntensityPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  /** Oldest → newest so in RTL flex the oldest sits on the right */
  const chronological = useMemo(
    () => [...days].sort((a, b) => a.date.localeCompare(b.date)),
    [days],
  );

  const maxEvents = useMemo(
    () => Math.max(1, ...chronological.map((d) => d.totalEvents)),
    [chronological],
  );

  const bars = useMemo(
    () =>
      chronological.map((day) => {
        const normalized = Math.min(1, day.intensity / 100);
        const eventNorm = day.totalEvents / maxEvents;
        const score = Math.max(normalized, eventNorm * 0.85);
        const height = Math.round(5 + score * 25);

        return {
          day,
          height,
          color: pickColor(score),
          shortLabel: shortPersianLabel(day),
        };
      }),
    [chronological, maxEvents],
  );

  /** Axis labels: first, last, and evenly spaced middles */
  const axisLabels = useMemo(() => {
    if (bars.length === 0) return [];
    if (bars.length <= 6) {
      return bars.map((b, index) => ({ ...b, index }));
    }
    const indexes = new Set<number>();
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      indexes.add(Math.round((i / steps) * (bars.length - 1)));
    }
    return [...indexes]
      .sort((a, b) => a - b)
      .map((index) => ({ ...bars[index]!, index }));
  }, [bars]);

  const hovered = bars.find((b) => b.day.date === hoveredDate) ?? null;
  const selected = activeDate;

  // Keep active bar visible in the horizontal scroller
  useEffect(() => {
    if (!activeDate || !scrollRef.current) return;
    const el = scrollRef.current.querySelector<HTMLElement>(
      `[data-day="${activeDate}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeDate]);

  if (bars.length === 0) {
    return (
      <div
        className={clsx(className)}
        style={{
          background: "#07101f",
          border: "1px solid #17233a",
          borderRadius: 12,
          height: 116,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8290a8",
          fontSize: 12,
        }}
      >
        در این بازه روزی برای نمایش شدت وجود ندارد.
      </div>
    );
  }

  const rangeLabel =
    bars.length > 0
      ? `${bars[0]!.shortLabel} تا ${bars[bars.length - 1]!.shortLabel}`
      : "";

  return (
    <div
      className={clsx("event-intensity-panel", className)}
      style={{
        direction: "rtl",
        background: "#07101f",
        border: "1px solid #17233a",
        borderRadius: 12,
        height: 116,
        overflow: "hidden",
        paddingInline: 16,
        display: "grid",
        gridTemplateColumns: "110px 1fr",
        gap: 14,
        alignItems: "stretch",
      }}
      aria-label="شدت رویدادها"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 8,
          minWidth: 105,
          maxWidth: 115,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 500,
            color: "#94A3B8",
            lineHeight: 1.2,
          }}
        >
          شدت رویدادها
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 10, color: "#8290a8" }}>کم</span>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {LEGEND_COLORS.map((color) => (
              <span
                key={color}
                style={{
                  width: 10,
                  height: 7,
                  borderRadius: 1.5,
                  background: color,
                  display: "inline-block",
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 10, color: "#8290a8" }}>زیاد</span>
        </div>

        <p style={{ margin: 0, fontSize: 9, color: "#64748B", lineHeight: 1.4 }}>
          {rangeLabel}
          <br />
          اسکرول افقی برای همه روزها
        </p>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-thin"
        style={{
          position: "relative",
          minWidth: 0,
          overflowX: "auto",
          overflowY: "hidden",
          paddingBottom: 4,
          paddingTop: 8,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            minWidth: Math.max(bars.length * 11, 320),
            height: "100%",
            paddingBottom: 20,
          }}
        >
          {/* Hover tooltip */}
          {hovered ? (
            <div
              role="tooltip"
              style={{
                position: "absolute",
                top: 0,
                zIndex: 20,
                // Place near hovered bar using its index
                right: hovered
                  ? bars.findIndex((b) => b.day.date === hovered.day.date) * 11
                  : 0,
                transform: "translateX(30%)",
                width: 180,
                borderRadius: 10,
                border: "1px solid #17233a",
                background: "#0B1528",
                padding: "8px 10px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
                pointerEvents: "none",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#F8FAFC",
                }}
              >
                {hovered.day.weekday} {hovered.day.persianDate}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 10, color: "#CBD5E1" }}>
                {hovered.day.totalEvents.toLocaleString("fa-IR")} رویداد
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 10, color: "#FCA5A5" }}>
                {hovered.day.enemyActionsCount.toLocaleString("fa-IR")} اقدام دشمن
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 10, color: "#93C5FD" }}>
                {hovered.day.governmentActionsCount.toLocaleString("fa-IR")} اقدام
                دولت
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: "#94A3B8" }}>
                شدت: {intensityLabel(hovered.day.intensity)}
              </p>
              {hovered.day.events[0] ? (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 10,
                    color: "#64748B",
                    lineHeight: 1.5,
                  }}
                >
                  {hovered.day.events[0].title}
                </p>
              ) : null}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 3,
              height: 34,
              position: "relative",
              zIndex: 1,
            }}
          >
            {bars.map((bar) => {
              const isActive = selected === bar.day.date;
              const isHovered = hoveredDate === bar.day.date;

              return (
                <button
                  key={bar.day.date}
                  type="button"
                  data-day={bar.day.date}
                  aria-label={`${bar.day.persianDate}، ${bar.day.totalEvents} رویداد`}
                  onMouseEnter={() => setHoveredDate(bar.day.date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onFocus={() => setHoveredDate(bar.day.date)}
                  onBlur={() => setHoveredDate(null)}
                  onClick={() => onSelectDay?.(bar.day.date)}
                  style={{
                    width: 8,
                    minWidth: 8,
                    height: bar.height,
                    padding: 0,
                    border: "none",
                    cursor: "pointer",
                    background: bar.color,
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    boxShadow: isActive
                      ? `0 0 10px ${bar.color}88`
                      : isHovered
                        ? `0 0 8px ${bar.color}55`
                        : "none",
                    outline: isActive ? "1px solid #448cff" : "none",
                    outlineOffset: 1,
                    transition: "box-shadow 120ms ease, transform 120ms ease",
                    transform: isHovered || isActive ? "scaleY(1.06)" : "none",
                    transformOrigin: "bottom",
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              height: 1,
              width: "100%",
              background: "#182840",
              position: "relative",
              marginTop: 0,
            }}
          >
            {axisLabels.map((item) => {
              const leftPx = item.index * 11 + 4;
              return (
                <span
                  key={`tick-${item.day.date}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: leftPx,
                    width: 1,
                    height: 5,
                    background: "#182840",
                  }}
                />
              );
            })}
          </div>

          <div style={{ position: "relative", height: 22, marginTop: 2 }}>
            {axisLabels.map((item) => {
              const leftPx = item.index * 11 + 4;
              const isSelected = selected === item.day.date;

              return (
                <button
                  key={`label-${item.day.date}`}
                  type="button"
                  onClick={() => onSelectDay?.(item.day.date)}
                  style={{
                    position: "absolute",
                    top: isSelected ? -2 : 4,
                    right: leftPx,
                    transform: "translateX(50%)",
                    border: isSelected ? "1px solid #448cff" : "none",
                    background: isSelected
                      ? "linear-gradient(180deg, #3478ed 0%, #1957c8 100%)"
                      : "transparent",
                    color: isSelected ? "#ffffff" : "#8290a8",
                    borderRadius: isSelected ? 7 : 0,
                    padding: isSelected ? "4px 10px" : 0,
                    fontSize: 10,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    boxShadow: isSelected
                      ? "0 0 12px rgba(39, 112, 255, 0.32)"
                      : "none",
                    zIndex: isSelected ? 2 : 1,
                  }}
                >
                  {item.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
