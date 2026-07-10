"use client";

import { MonthlyDayCellCard } from "@/components/views/monthly/MonthlyDayCell";
import { MonthlyToolbar } from "@/components/views/monthly/MonthlyToolbar";
import {
  WEEKDAY_LABELS,
  buildMonthCells,
  findMonthOption,
  listMonthOptions,
  monthLabel,
  resolveMonthFromDate,
  shiftPersianMonth,
  summarizeMonth,
  toMonthlyDateString,
  getPersianYmd,
} from "@/lib/monthly";
import type { TimelineDay } from "@/types/timeline";
import { useMemo, useState } from "react";

type MonthlyViewProps = {
  days: TimelineDay[];
  selectedDay?: string | null;
  onSelectDay: (date: string) => void;
};

export function MonthlyView({
  days,
  selectedDay = null,
  onSelectDay,
}: MonthlyViewProps) {
  const months = useMemo(() => listMonthOptions(days), [days]);

  const defaultDate =
    selectedDay ?? days[0]?.date ?? toMonthlyDateString(new Date());

  const initial = resolveMonthFromDate(defaultDate, months);
  const fallback = getPersianYmd(defaultDate);

  const [cursor, setCursor] = useState(() => ({
    year: initial?.year ?? fallback.year,
    month: initial?.month ?? fallback.month,
  }));

  const activeMonth =
    findMonthOption(months, cursor.year, cursor.month) ??
    months[months.length - 1] ??
    null;

  const year = activeMonth?.year ?? cursor.year;
  const month = activeMonth?.month ?? cursor.month;
  const activeKey = `${year}-${String(month).padStart(2, "0")}`;

  const cells = useMemo(
    () => buildMonthCells(year, month, days),
    [year, month, days],
  );

  const summary = useMemo(() => summarizeMonth(cells), [cells]);
  const title = monthLabel(year, month);

  const activeIndex = months.findIndex((m) => m.key === activeKey);
  const canGoPrev = activeIndex > 0 || months.length === 0;
  const canGoNext =
    (activeIndex >= 0 && activeIndex < months.length - 1) || months.length === 0;

  const selectMonthKey = (key: string) => {
    const found = months.find((m) => m.key === key);
    if (!found) return;
    setCursor({ year: found.year, month: found.month });
  };

  const goPrev = () => {
    if (activeIndex > 0) {
      const prev = months[activeIndex - 1]!;
      setCursor({ year: prev.year, month: prev.month });
      return;
    }
    setCursor((c) => shiftPersianMonth(c.year, c.month, -1));
  };

  const goNext = () => {
    if (activeIndex >= 0 && activeIndex < months.length - 1) {
      const next = months[activeIndex + 1]!;
      setCursor({ year: next.year, month: next.month });
      return;
    }
    setCursor((c) => shiftPersianMonth(c.year, c.month, 1));
  };

  return (
    <section
      className="space-y-3"
      style={{ direction: "rtl", textAlign: "right" }}
    >
      <MonthlyToolbar
        months={months}
        activeKey={activeKey}
        title={title}
        onSelectMonth={selectMonthKey}
        onPrevMonth={goPrev}
        onNextMonth={goNext}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi
          label="روزهای ماه"
          value={summary.dayCount.toLocaleString("fa-IR")}
        />
        <Kpi
          label="روز فعال"
          value={summary.activeDays.toLocaleString("fa-IR")}
        />
        <Kpi
          label="اقدام دشمن"
          value={summary.enemy.toLocaleString("fa-IR")}
          tone="var(--enemy)"
        />
        <Kpi
          label="اقدام دولت"
          value={summary.government.toLocaleString("fa-IR")}
          tone="var(--government)"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 sm:p-3">
        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-[var(--text-muted)]">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="py-1">
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell) => (
            <MonthlyDayCellCard
              key={cell.key}
              cell={cell}
              selected={!!cell.date && selectedDay === cell.date}
              onSelect={onSelectDay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5">
      <p className="m-0 text-[11px] text-[var(--text-secondary)]">{label}</p>
      <p
        className="mt-1 mb-0 text-lg font-bold tabular-nums text-[var(--text-primary)]"
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
