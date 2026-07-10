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

  useEffect(() => {
    if (!activeDate || !scrollRef.current) return;
    const container = scrollRef.current;
    const el = container.querySelector<HTMLElement>(
      `[data-day="${activeDate}"]`,
    );
    if (!el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta =
      elRect.left +
      elRect.width / 2 -
      (containerRect.left + containerRect.width / 2);

    if (Math.abs(delta) < 2) return;
    container.scrollBy({ left: delta, behavior: "smooth" });
  }, [activeDate]);

  if (bars.length === 0) {
    return (
      <div
        className={clsx(
          "flex h-[116px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel)] text-xs text-[var(--text-secondary)]",
          className,
        )}
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
      className={clsx(
        "event-intensity-panel grid h-[116px] grid-cols-[110px_1fr] items-stretch gap-3.5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4",
        className,
      )}
      style={{ direction: "rtl" }}
      aria-label="شدت رویدادها"
    >
      <div className="flex max-w-[115px] min-w-[105px] flex-col justify-center gap-2">
        <p className="m-0 text-xs font-medium leading-tight text-[var(--text-secondary)]">
          شدت رویدادها
        </p>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--text-muted)]">کم</span>
          <div className="flex items-center gap-0.5">
            {LEGEND_COLORS.map((color) => (
              <span
                key={color}
                className="inline-block h-[7px] w-2.5 rounded-[1.5px]"
                style={{ background: color }}
              />
            ))}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">زیاد</span>
        </div>

        <p className="m-0 text-[9px] leading-snug text-[var(--text-muted)]">
          {rangeLabel}
          <br />
          اسکرول افقی برای همه روزها
        </p>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-thin relative min-w-0 overflow-x-auto overflow-y-hidden pt-2 pb-1"
      >
        <div
          className="relative flex h-full flex-col justify-end pb-5"
          style={{ minWidth: Math.max(bars.length * 11, 320) }}
        >
          {hovered ? (
            <div
              role="tooltip"
              className="pointer-events-none absolute top-0 z-20 w-[180px] rounded-[10px] border border-[var(--border)] bg-[var(--panel-2)] px-2.5 py-2 shadow-xl"
              style={{
                right:
                  bars.findIndex((b) => b.day.date === hovered.day.date) * 11,
                transform: "translateX(30%)",
              }}
            >
              <p className="m-0 text-[11px] font-semibold text-[var(--text-primary)]">
                {hovered.day.weekday} {hovered.day.persianDate}
              </p>
              <p className="mt-1.5 mb-0 text-[10px] text-[var(--text-secondary)]">
                {hovered.day.totalEvents.toLocaleString("fa-IR")} رویداد
              </p>
              <p className="mt-0.5 mb-0 text-[10px] text-[var(--enemy)]">
                {hovered.day.enemyActionsCount.toLocaleString("fa-IR")} اقدام دشمن
              </p>
              <p className="mt-0.5 mb-0 text-[10px] text-[var(--government)]">
                {hovered.day.governmentActionsCount.toLocaleString("fa-IR")} اقدام
                دولت
              </p>
              <p className="mt-1 mb-0 text-[10px] text-[var(--text-secondary)]">
                شدت: {intensityLabel(hovered.day.intensity)}
              </p>
              {hovered.day.events[0] ? (
                <p className="mt-1.5 mb-0 text-[10px] leading-snug text-[var(--text-muted)]">
                  {hovered.day.events[0].title}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="relative z-[1] flex h-[34px] items-end gap-[3px]">
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
                  className="min-w-2 cursor-pointer border-0 p-0 transition-[box-shadow,transform] duration-120"
                  style={{
                    width: 8,
                    height: bar.height,
                    background: bar.color,
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    boxShadow: isActive
                      ? `0 0 10px ${bar.color}88`
                      : isHovered
                        ? `0 0 8px ${bar.color}55`
                        : "none",
                    outline: isActive
                      ? "1px solid var(--primary)"
                      : "none",
                    outlineOffset: 1,
                    transform:
                      isHovered || isActive ? "scaleY(1.06)" : "none",
                    transformOrigin: "bottom",
                  }}
                />
              );
            })}
          </div>

          <div className="relative mt-0 h-px w-full bg-[var(--border)]">
            {axisLabels.map((item) => {
              const leftPx = item.index * 11 + 4;
              return (
                <span
                  key={`tick-${item.day.date}`}
                  className="absolute top-0 h-[5px] w-px bg-[var(--border)]"
                  style={{ right: leftPx }}
                />
              );
            })}
          </div>

          <div className="relative mt-0.5 h-[22px]">
            {axisLabels.map((item) => {
              const leftPx = item.index * 11 + 4;
              const isSelected = selected === item.day.date;

              return (
                <button
                  key={`label-${item.day.date}`}
                  type="button"
                  onClick={() => onSelectDay?.(item.day.date)}
                  className="absolute cursor-pointer whitespace-nowrap text-[10px] leading-none"
                  style={{
                    top: isSelected ? -2 : 4,
                    right: leftPx,
                    transform: "translateX(50%)",
                    border: isSelected
                      ? "1px solid var(--primary)"
                      : "none",
                    background: isSelected
                      ? "linear-gradient(180deg, #3478ed 0%, #1957c8 100%)"
                      : "transparent",
                    color: isSelected
                      ? "#ffffff"
                      : "var(--text-muted)",
                    borderRadius: isSelected ? 7 : 0,
                    padding: isSelected ? "4px 10px" : 0,
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
