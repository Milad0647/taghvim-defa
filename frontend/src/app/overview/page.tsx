"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { SummaryBar } from "@/components/timeline/SummaryBar";
import { EventIntensityPanel } from "@/components/timeline/EventIntensityPanel";
import { computeSummary } from "@/data/timeline.mock";
import { loadTimelineDays } from "@/lib/timeline-store";
import type { TimelineDay } from "@/types/timeline";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";

function OverviewContent() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [days, setDays] = useState<TimelineDay[]>([]);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const summary = useMemo(() => computeSummary(days), [days]);

  useEffect(() => {
    const loaded = loadTimelineDays();
    setDays(loaded);
    setActiveDate(loaded[0]?.date ?? null);
  }, []);

  return (
    <div className="flex min-h-screen gap-4 bg-[var(--background)] p-3 lg:p-4">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
        stats={{
          totalEvents: summary.totalEvents,
          enemy: summary.enemy,
          government: summary.government,
          activeUsers: summary.activeUsers,
        }}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">نمای کلی</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              خلاصه وضعیت رخدادها در یک نگاه
            </p>
          </div>
          <Link
            href="/timeline"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            رفتن به خط زمانی
          </Link>
        </div>

        {days.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center text-sm text-[var(--text-secondary)]">
            داده‌ای برای نمایش وجود ندارد. از پنل ادمین می‌توانید داده نمونه را
            بازیابی کنید یا رویداد واقعی ثبت کنید.
          </div>
        ) : (
          <>
            <SummaryBar
              totalEvents={summary.totalEvents}
              enemy={summary.enemy}
              government={summary.government}
              responseRatio={summary.responseRatio}
              avgResponseMinutes={summary.avgResponseMinutes}
            />

            <EventIntensityPanel
              days={days}
              activeDate={activeDate}
              onSelectDay={(date) => {
                setActiveDate(date);
                window.location.href = `/timeline?date=${date}`;
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[var(--text-secondary)]">در حال بارگذاری...</div>}>
      <OverviewContent />
    </Suspense>
  );
}
