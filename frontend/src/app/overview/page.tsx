"use client";

import { AppSidebar, MobileMenuButton } from "@/components/layout/AppSidebar";
import { OverviewDashboard } from "@/components/overview/OverviewDashboard";
import { computeSummary } from "@/data/timeline.mock";
import { loadTimelineDays } from "@/lib/timeline-store";
import type { TimelineDay } from "@/types/timeline";
import { Suspense, useEffect, useMemo, useState } from "react";

function OverviewContent() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [days, setDays] = useState<TimelineDay[]>([]);
  const summary = useMemo(() => computeSummary(days), [days]);

  useEffect(() => {
    setDays(loadTimelineDays());
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
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileMenuButton onClick={() => setMobileOpen(true)} />
          <p className="m-0 text-sm font-semibold text-[var(--text-primary)]">
            نمای کلی
          </p>
        </div>

        {days.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center text-sm text-[var(--text-secondary)]">
            داده‌ای برای نمایش وجود ندارد. از پنل ادمین می‌توانید داده نمونه را
            بازیابی کنید یا رویداد واقعی ثبت کنید.
          </div>
        ) : (
          <OverviewDashboard days={days} />
        )}
      </main>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-[var(--text-secondary)]">در حال بارگذاری...</div>
      }
    >
      <OverviewContent />
    </Suspense>
  );
}
