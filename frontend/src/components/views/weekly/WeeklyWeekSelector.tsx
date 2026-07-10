"use client";

import type { WeekOption } from "@/lib/weekly";
import {
  startOfWeekSaturday,
  toWeeklyDateString,
} from "@/lib/weekly";
import {
  getPersianYmd,
  monthLabel,
  shiftPersianMonth,
} from "@/lib/monthly";
import {
  WEEKDAY_LABELS,
  buildPersianCalendarCells,
} from "@/lib/persian-date";
import clsx from "clsx";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type WeeklyWeekSelectorProps = {
  weeks: WeekOption[];
  activeStartDate: string;
  onSelectWeek: (startDate: string) => void;
};

export function WeeklyWeekSelector({
  weeks,
  activeStartDate,
  onSelectWeek,
}: WeeklyWeekSelectorProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const active = useMemo(() => {
    const key = toWeeklyDateString(startOfWeekSaturday(activeStartDate));
    return weeks.find((w) => w.startDate === key) ?? weeks[weeks.length - 1] ?? null;
  }, [weeks, activeStartDate]);

  const initial = active
    ? getPersianYmd(active.startDate)
    : getPersianYmd(new Date());

  const [cursorYear, setCursorYear] = useState(initial.year);
  const [cursorMonth, setCursorMonth] = useState(initial.month);

  useEffect(() => {
    if (!active) return;
    const ymd = getPersianYmd(active.startDate);
    setCursorYear(ymd.year);
    setCursorMonth(ymd.month);
  }, [active?.startDate]);

  useEffect(() => {
    if (!calendarOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCalendarOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [calendarOpen]);

  const cells = useMemo(
    () => buildPersianCalendarCells(cursorYear, cursorMonth),
    [cursorYear, cursorMonth],
  );

  const weekStartSet = useMemo(
    () => new Set(weeks.map((w) => w.startDate)),
    [weeks],
  );

  const activeWeekStart = active?.startDate ?? "";
  const activeWeekEnd = active?.endDate ?? "";

  return (
    <div ref={rootRef} className="relative flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel-2)] p-1 scrollbar-thin">
          {weeks.map((week) => {
            const selected = week.startDate === activeWeekStart;
            return (
              <button
                key={week.startDate}
                type="button"
                onClick={() => onSelectWeek(week.startDate)}
                title={week.shortRange}
                className={clsx(
                  "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                  selected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]",
                )}
              >
                {week.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setCalendarOpen((v) => !v)}
          className={clsx(
            "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition",
            calendarOpen
              ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--border)] bg-[var(--panel-2)] text-[var(--text-primary)] hover:bg-[var(--hover)]",
          )}
          aria-expanded={calendarOpen}
          aria-label="باز کردن تقویم انتخاب هفته"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          تقویم
        </button>
      </div>

      {calendarOpen ? (
        <div className="absolute top-[calc(100%+8px)] left-0 z-40 w-[300px] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-2xl">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--hover)]"
              onClick={() => {
                const next = shiftPersianMonth(cursorYear, cursorMonth, -1);
                setCursorYear(next.year);
                setCursorMonth(next.month);
              }}
              aria-label="ماه قبل"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {monthLabel(cursorYear, cursorMonth)}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--hover)]"
                onClick={() => {
                  const next = shiftPersianMonth(cursorYear, cursorMonth, 1);
                  setCursorYear(next.year);
                  setCursorMonth(next.month);
                }}
                aria-label="ماه بعد"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--hover)]"
                onClick={() => setCalendarOpen(false)}
                aria-label="بستن تقویم"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--text-muted)]">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              if (!cell.inMonth || !cell.date || cell.day == null) {
                return <span key={cell.key} className="h-9" />;
              }

              const key = cell.date;
              const weekStart = toWeeklyDateString(startOfWeekSaturday(key));
              const inData = weekStartSet.has(weekStart);
              const inActiveWeek =
                activeWeekStart &&
                key >= activeWeekStart &&
                key <= activeWeekEnd;
              const isWeekStart = key === weekStart;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={!inData}
                  onClick={() => {
                    onSelectWeek(weekStart);
                    setCalendarOpen(false);
                  }}
                  className={clsx(
                    "h-9 rounded-lg text-[11px] transition",
                    inActiveWeek &&
                      "bg-[var(--primary)]/15 text-[var(--primary)]",
                    isWeekStart &&
                      inActiveWeek &&
                      "bg-blue-600 font-bold text-white",
                    inData &&
                      !inActiveWeek &&
                      "text-[var(--text-primary)] hover:bg-[var(--hover)]",
                    !inData && "cursor-not-allowed text-[var(--text-muted)]",
                  )}
                  title={
                    inData
                      ? `انتخاب هفته ${weeks.find((w) => w.startDate === weekStart)?.label ?? ""}`
                      : "خارج از بازه داده"
                  }
                >
                  {cell.day.toLocaleString("fa-IR")}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[10px] leading-5 text-[var(--text-muted)]">
            با کلیک روی هر روز، همان هفته انتخاب می‌شود.
            {active ? (
              <>
                <br />
                انتخاب فعلی: {active.label} ({active.shortRange})
              </>
            ) : null}
          </p>
        </div>
      ) : null}
    </div>
  );
}
