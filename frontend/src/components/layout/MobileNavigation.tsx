"use client";

import type { TimelineViewMode } from "@/types/timeline";
import clsx from "clsx";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Map,
  Grid3X3,
  Sun,
} from "lucide-react";

const ITEMS: { id: TimelineViewMode; label: string; icon: typeof Map }[] = [
  { id: "timeline", label: "خط زمانی", icon: CalendarRange },
  { id: "day", label: "روزانه", icon: Sun },
  { id: "week", label: "هفتگی", icon: CalendarDays },
  { id: "month", label: "ماهانه", icon: CalendarDays },
  { id: "heatmap", label: "نقشه حرارتی", icon: Grid3X3 },
  { id: "map", label: "نقشه", icon: Map },
  { id: "analytics", label: "آمار", icon: BarChart3 },
];

type MobileNavigationProps = {
  value: TimelineViewMode;
  onChange: (view: TimelineViewMode) => void;
};

export function MobileNavigation({ value, onChange }: MobileNavigationProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface-1)]/95 px-2 py-2 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={clsx(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px]",
                active ? "bg-[var(--purple)]/20 text-indigo-200" : "text-[var(--text-secondary)]",
              )}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
