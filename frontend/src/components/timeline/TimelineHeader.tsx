"use client";

import { MobileMenuButton } from "@/components/layout/AppSidebar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ViewSwitcher } from "@/components/timeline/ViewSwitcher";
import type { TimelineViewMode } from "@/types/timeline";
import { Bell, Download, Filter, Search, UserRound } from "lucide-react";

type TimelineHeaderProps = {
  title?: string;
  subtitle?: string;
  showViewSwitcher?: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onOpenFilters: () => void;
  onOpenMobileMenu: () => void;
  activeFilterCount?: number;
  selectedView: TimelineViewMode;
  onViewChange: (view: TimelineViewMode) => void;
  dateRangeLabel?: string;
};

export function TimelineHeader({
  title = "خط زمانی رویدادها و اقدامات",
  subtitle = "نمایش زنده رخدادها و پاسخ‌های ثبت‌شده",
  searchQuery,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onOpenFilters,
  onOpenMobileMenu,
  activeFilterCount = 0,
  selectedView,
  onViewChange,
  dateRangeLabel,
  showViewSwitcher = true,
}: TimelineHeaderProps) {
  return (
    <header className="sticky top-0 z-30 space-y-3 bg-[var(--background)]/95 pb-1 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <MobileMenuButton onClick={onOpenMobileMenu} />

        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جست‌وجوی رویداد، نهاد، شهر یا منبع..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] py-2.5 pr-10 pl-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-blue-500/50"
            aria-label="جست‌وجو"
          />
        </label>

        <ThemeToggle />

        <button
          type="button"
          className="relative shrink-0 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2.5 text-[var(--text-secondary)] hover:bg-[var(--hover)]"
          aria-label="اعلان‌ها"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            ۱۲
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
            ع
          </div>
          <div className="hidden text-xs sm:block">
            <p className="font-semibold text-[var(--text-primary)]">علی رضایی</p>
            <p className="text-[var(--text-secondary)]">مدیر</p>
          </div>
          <UserRound className="hidden h-3.5 w-3.5 text-[var(--text-muted)] sm:block" />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] sm:text-xl">
              {title}
            </h1>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showViewSwitcher ? (
              <ViewSwitcher value={selectedView} onChange={onViewChange} compact />
            ) : null}

            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1.5">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="bg-transparent text-[11px] text-[var(--text-secondary)] outline-none"
                aria-label="از تاریخ"
              />
              <span className="text-[var(--text-muted)]">|</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="bg-transparent text-[11px] text-[var(--text-secondary)] outline-none"
                aria-label="تا تاریخ"
              />
            </div>

            {dateRangeLabel ? (
              <span className="hidden text-[11px] text-[var(--text-muted)] xl:inline">
                {dateRangeLabel}
              </span>
            ) : null}

            <button
              type="button"
              onClick={onOpenFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--hover)]"
            >
              <Filter className="h-3.5 w-3.5" />
              فیلترها
              {activeFilterCount > 0 ? (
                <span className="rounded-md bg-blue-500/15 px-1.5 text-[10px] text-[var(--primary)]">
                  {activeFilterCount.toLocaleString("fa-IR")}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-xs text-[var(--primary)] hover:bg-blue-500/20"
            >
              <Download className="h-3.5 w-3.5" />
              صادرات
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
