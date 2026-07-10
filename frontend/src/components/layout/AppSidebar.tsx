"use client";

import clsx from "clsx";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Info,
  LayoutDashboard,
  Map,
  Menu,
  Plus,
  Settings,
  Shield,
  Swords,
  Users,
  UserCheck,
  X,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const MENU = [
  { href: "/overview", label: "نمای کلی", icon: LayoutDashboard, match: "overview" },
  { href: "/timeline", label: "خط زمانی", icon: CalendarRange, match: "timeline" },
  { href: "/timeline?view=week", label: "نمای هفتگی", icon: CalendarDays, match: "week" },
  { href: "/timeline?view=month", label: "نمای ماهانه", icon: CalendarDays, match: "month" },
  { href: "/timeline?view=map", label: "نقشه رویدادها", icon: Map, match: "map" },
  { href: "/timeline?view=analytics", label: "آمار و نمودارها", icon: BarChart3, match: "analytics" },
  { href: "/admin", label: "مدیریت محتوا", icon: Shield, match: "admin" },
  { href: "/admin/users", label: "کاربران", icon: Users, match: "admin-users" },
  { href: "/admin/settings", label: "تنظیمات", icon: Settings, match: "admin-settings" },
  { href: "/admin/login", label: "ورود ادمین", icon: Info, match: "admin-login" },
] as const;

type AppSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onCreateEvent: () => void;
  stats: {
    totalEvents: number;
    enemy: number;
    government: number;
    activeUsers: number;
  };
};

export function AppSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onCreateEvent,
  stats,
}: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "timeline";

  useEffect(() => {
    onCloseMobile();
  }, [pathname, view, onCloseMobile]);

  const content = (
    <div
      className={clsx(
        "flex h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-4">
        {!collapsed ? (
          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
                <Shield className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">گزارش زنده</p>
                <p className="text-[10px] text-[var(--text-secondary)]">رویدادها و اقدامات</p>
              </div>
            </div>
          </div>
        ) : (
          <Shield className="mx-auto h-5 w-5 text-[var(--primary)]" />
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--hover)] lg:inline-flex"
          aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="inline-flex rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--hover)] lg:hidden"
          aria-label="بستن منو"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2 scrollbar-thin">
        {MENU.map((item) => {
          const active =
            item.match === "overview"
              ? pathname.startsWith("/overview")
              : item.match === "admin"
                ? pathname === "/admin"
                : item.match === "admin-users"
                  ? pathname.startsWith("/admin/users")
                  : item.match === "admin-settings"
                    ? pathname.startsWith("/admin/settings")
                    : item.match === "admin-login"
                      ? pathname.startsWith("/admin/login")
                      : item.match === "timeline"
                        ? pathname.startsWith("/timeline") && view === "timeline"
                        : pathname.startsWith("/timeline") && view === item.match;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "relative flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] transition",
                active
                  ? "bg-blue-500/15 font-medium text-[var(--primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text-primary)]",
                collapsed && "justify-center px-2",
              )}
              title={item.label}
            >
              {active ? (
                <span className="absolute inset-y-2 right-0 w-[3px] rounded-full bg-[var(--primary)]" />
              ) : null}
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-[var(--border)] p-3">
        <ThemeToggle className="w-full justify-center" compact={collapsed} />

        {!collapsed ? (
          <div className="space-y-2.5 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] p-3">
            <StatRow
              icon={<Activity className="h-3.5 w-3.5" />}
              label="کل رویدادها"
              value={stats.totalEvents}
              color="var(--text-primary)"
            />
            <StatRow
              icon={<Swords className="h-3.5 w-3.5" />}
              label="اقدامات دشمن"
              value={stats.enemy}
              color="#EF4444"
            />
            <StatRow
              icon={<Shield className="h-3.5 w-3.5" />}
              label="اقدامات دولت"
              value={stats.government}
              color="#3B82F6"
            />
            <StatRow
              icon={<UserCheck className="h-3.5 w-3.5" />}
              label="کاربران فعال"
              value={stats.activeUsers}
              color="#22C55E"
            />
          </div>
        ) : null}

        <button
          type="button"
          onClick={onCreateEvent}
          className={clsx(
            "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500",
            collapsed && "px-2",
          )}
          aria-label="ثبت رویداد جدید"
        >
          <Plus className="h-4 w-4" />
          {!collapsed ? <span>ثبت رویداد جدید</span> : null}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-3 hidden self-start lg:block">{content}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--overlay)]"
            aria-label="بستن پس‌زمینه منو"
            onClick={onCloseMobile}
          />
          <div className="absolute inset-y-3 right-3 shadow-2xl">{content}</div>
        </div>
      ) : null}
    </>
  );
}

function StatRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
        <span style={{ color }}>{icon}</span>
        {label}
      </span>
      <span className="font-bold tabular-nums" style={{ color }}>
        {value.toLocaleString("fa-IR")}
      </span>
    </div>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--panel-2)] p-2 text-[var(--text-primary)] lg:hidden"
      aria-label="باز کردن منو"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
