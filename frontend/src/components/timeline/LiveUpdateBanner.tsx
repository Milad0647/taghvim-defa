"use client";

import { Radio } from "lucide-react";

type LiveUpdateBannerProps = {
  online?: boolean;
  lastUpdatedLabel: string;
  pendingCount: number;
  onShowNew: () => void;
};

export function LiveUpdateBanner({
  online = true,
  lastUpdatedLabel,
  pendingCount,
  onShowNew,
}: LiveUpdateBannerProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          {online ? "آنلاین" : "آفلاین"}
        </span>
        <span className="text-[var(--text-secondary)]">
          آخرین بروزرسانی: {lastUpdatedLabel}
        </span>
        {pendingCount > 0 ? (
          <span className="text-amber-300">
            {pendingCount.toLocaleString("fa-IR")} رخداد جدید
          </span>
        ) : null}
      </div>

      {pendingCount > 0 ? (
        <button
          type="button"
          onClick={onShowNew}
          className="rounded-xl bg-amber-500/15 px-3 py-1.5 text-sm text-amber-200 hover:bg-amber-500/25"
        >
          نمایش رخدادهای جدید
        </button>
      ) : null}
    </div>
  );
}
