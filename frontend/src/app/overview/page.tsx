"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { SummaryBar } from "@/components/timeline/SummaryBar";
import { EventIntensityPanel } from "@/components/timeline/EventIntensityPanel";
import { computeSummary, timelineMockDays } from "@/data/timeline.mock";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";

function OverviewContent() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDate, setActiveDate] = useState(timelineMockDays[0]?.date ?? null);
  const summary = useMemo(() => computeSummary(timelineMockDays), []);

  return (
    <div className="flex min-h-screen gap-4 bg-[var(--background)] p-3 lg:p-4">
      <AppSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
        onCreateEvent={() => {
          window.location.href = "/timeline";
        }}
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
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
          >
            رفتن به خط زمانی
          </Link>
        </div>

        <SummaryBar
          totalEvents={summary.totalEvents}
          enemy={summary.enemy}
          government={summary.government}
          responseRatio={summary.responseRatio}
          avgResponseMinutes={summary.avgResponseMinutes}
        />

        <EventIntensityPanel
          days={timelineMockDays}
          activeDate={activeDate}
          onSelectDay={(date) => {
            setActiveDate(date);
            window.location.href = `/timeline?date=${date}`;
          }}
        />
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
