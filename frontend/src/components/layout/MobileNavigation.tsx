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
  { id: "timeline", label: "زمانی", icon: CalendarRange },
  { id: "day", label: "روز", icon: Sun },
  { id: "week", label: "هفته", icon: CalendarDays },
  { id: "month", label: "ماه", icon: CalendarDays },
  { id: "analytics", label: "آمار", icon: BarChart3 },
  { id: "heatmap", label: "حرارتی", icon: Grid3X3 },
  { id: "map", label: "نقشه", icon: Map },
];

type MobileNavigationProps = {
  value: TimelineViewMode;
  onChange: (view: TimelineViewMode) => void;
};

export function MobileNavigation({ value, onChange }: MobileNavigationProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface-1)]/95 px-1 py-1.5 backdrop-blur md:hidden safe-bottom">
      <div className="mx-auto flex max-w-lg items-stretch gap-0.5 overflow-x-auto scrollbar-thin">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={clsx(
                "flex min-w-[3.25rem] flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[9px]",
                active
                  ? "bg-blue-500/15 text-[var(--primary)]"
                  : "text-[var(--text-secondary)]",
              )}
              aria-label={item.label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
