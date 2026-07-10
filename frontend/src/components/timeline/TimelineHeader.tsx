"use client";

import { MobileMenuButton } from "@/components/layout/AppSidebar";
import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ViewSwitcher } from "@/components/timeline/ViewSwitcher";
import type { TimelineViewMode } from "@/types/timeline";
import { Bell, Filter, Search, UserRound } from "lucide-react";
import Link from "next/link";

type TimelineHeaderProps = {
  showViewSwitcher?: boolean;
  showDateFilters?: boolean;
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
};

export function TimelineHeader({
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
  showViewSwitcher = false,
  showDateFilters = false,
}: TimelineHeaderProps) {
  const showExtras = showViewSwitcher || showDateFilters;

  return (
    <header className="sticky top-0 z-30 space-y-2 bg-[var(--background)]/95 pb-1 backdrop-blur-md">
      <div className="flex items-center gap-2 sm:gap-3">
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

        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-xs text-[var(--text-primary)] hover:bg-[var(--hover)]"
        >
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">فیلترها</span>
          {activeFilterCount > 0 ? (
            <span className="rounded-md bg-blue-500/15 px-1.5 text-[10px] text-[var(--primary)]">
              {activeFilterCount.toLocaleString("fa-IR")}
            </span>
          ) : null}
        </button>

        <ThemeToggle />

        <button
          type="button"
          className="relative hidden shrink-0 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2.5 text-[var(--text-secondary)] hover:bg-[var(--hover)] sm:inline-flex"
          aria-label="اعلان‌ها"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            ۱۲
          </span>
        </button>

        <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1.5 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
            ع
          </div>
          <div className="hidden text-xs lg:block">
            <p className="font-semibold text-[var(--text-primary)]">علی رضایی</p>
            <p className="text-[var(--text-secondary)]">مدیر</p>
          </div>
          <UserRound className="hidden h-3.5 w-3.5 text-[var(--text-muted)] xl:block" />
        </div>
      </div>

      {showExtras ? (
        <div className="flex flex-wrap items-center gap-2">
          {showViewSwitcher ? (
            <ViewSwitcher value={selectedView} onChange={onViewChange} compact />
          ) : null}
          {showDateFilters ? (
            <>
              <PersianDatePicker
                compact
                value={dateFrom}
                onChange={onDateFromChange}
                placeholder="از تاریخ"
                ariaLabel="از تاریخ"
                className="min-w-[130px]"
              />
              <PersianDatePicker
                compact
                value={dateTo}
                onChange={onDateToChange}
                placeholder="تا تاریخ"
                ariaLabel="تا تاریخ"
                className="min-w-[130px]"
              />
            </>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
