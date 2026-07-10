"use client";

import { getCurrentUser, logoutRequest } from "@/lib/auth";
import { ROLE_LABELS, ROLE_PERMISSIONS, type AdminUser } from "@/types/auth";
import clsx from "clsx";
import {
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Shield,
  Building2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { IranEmblem } from "@/components/brand/IranEmblem";
import { CreateEventForm } from "@/components/forms/CreateEventForm";
import { getSiteBranding } from "@/lib/branding";

const NAV = [
  { href: "/admin", label: "داشبورد ادمین", icon: LayoutDashboard, exact: true },
  { href: "/admin/agencies", label: "وزارتخانه‌ها", icon: Building2, exact: false },
  { href: "/admin/users", label: "کاربران و دسترسی‌ها", icon: Users, exact: false },
  { href: "/admin/settings", label: "تنظیمات داشبورد", icon: Settings, exact: false },
  { href: "/timeline", label: "بازگشت به تقویم", icon: Shield, exact: false },
] as const;

export function RequireAuth({
  children,
  requireManageUsers,
  requireManageSettings,
  requireManageAgencies,
}: {
  children: ReactNode;
  requireManageUsers?: boolean;
  requireManageSettings?: boolean;
  requireManageAgencies?: boolean;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.replace("/admin/login");
      return;
    }

    const perms = ROLE_PERMISSIONS[current.role];
    if (requireManageUsers && !perms.manageUsers) {
      router.replace("/admin");
      return;
    }
    if (requireManageSettings && !perms.manageSettings) {
      router.replace("/admin");
      return;
    }
    if (requireManageAgencies && !perms.manageAgencies) {
      router.replace("/admin");
      return;
    }

    setUser(current);
    setReady(true);
  }, [
    router,
    requireManageUsers,
    requireManageSettings,
    requireManageAgencies,
  ]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--text-secondary)]">
        در حال بررسی دسترسی...
      </div>
    );
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}

function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const perms = ROLE_PERMISSIONS[user.role];
  const [createOpen, setCreateOpen] = useState(false);
  const [branding, setBranding] = useState(() => getSiteBranding());

  useEffect(() => {
    setBranding(getSiteBranding());
  }, []);

  async function onLogout() {
    await logoutRequest();
    router.replace("/admin/login");
  }

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]"
      style={{ direction: "rtl" }}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl gap-4 p-4">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--panel)] lg:flex">
          <div className="border-b border-[var(--border)] p-4">
            <div className="mb-2 flex items-center gap-2">
              <IranEmblem className="h-7 w-7 text-[var(--logo)]" />
              <div>
                <p className="text-xs text-[var(--text-secondary)]">پنل مدیریت</p>
                <h1 className="text-lg font-bold text-[var(--text-primary)]">
                  {branding.siteTitle}
                </h1>
                <p className="mt-0.5 text-[10px] leading-4 text-[var(--text-muted)]">
                  {branding.siteTagline}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-2">
            {NAV.map((item) => {
              if (item.href === "/admin/users" && !perms.manageUsers) return null;
              if (item.href === "/admin/agencies" && !perms.manageAgencies) {
                return null;
              }
              if (item.href === "/admin/settings" && !perms.manageSettings) {
                return null;
              }

              const active = item.exact
                ? pathname === item.href
                : item.href === "/timeline"
                  ? pathname.startsWith("/timeline")
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-blue-500/15 text-[var(--primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--hover)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-[var(--border)] p-3">
            {perms.manageContent ? (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                ثبت رویداد جدید
              </button>
            ) : null}
            <ThemeToggle className="w-full justify-center" />
            <div className="rounded-xl bg-[var(--panel-2)] p-3 text-xs">
              <p className="font-semibold text-[var(--text-primary)]">{user.name}</p>
              <p className="mt-1 text-[var(--text-secondary)]">{user.email}</p>
              <p className="mt-1 text-[var(--primary)]">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--hover)]"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 lg:hidden">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{user.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{ROLE_LABELS[user.role]}</p>
            </div>
            <div className="flex items-center gap-2">
              {perms.manageContent ? (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  ثبت رویداد
                </button>
              ) : null}
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs"
              >
                خروج
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:hidden">
            {NAV.map((item) => {
              if (item.href === "/admin/users" && !perms.manageUsers) return null;
              if (item.href === "/admin/agencies" && !perms.manageAgencies) {
                return null;
              }
              if (item.href === "/admin/settings" && !perms.manageSettings) {
                return null;
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--text-secondary)]"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {children}
        </main>
      </div>

      {perms.manageContent ? (
        <CreateEventForm open={createOpen} onClose={() => setCreateOpen(false)} />
      ) : null}
    </div>
  );
}
