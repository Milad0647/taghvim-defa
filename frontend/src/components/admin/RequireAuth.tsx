"use client";

import { getCurrentUser, logoutRequest } from "@/lib/auth";
import { ROLE_LABELS, ROLE_PERMISSIONS, type AdminUser } from "@/types/auth";
import clsx from "clsx";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const NAV = [
  { href: "/admin", label: "داشبورد ادمین", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "کاربران و دسترسی‌ها", icon: Users, exact: false },
  { href: "/admin/settings", label: "تنظیمات داشبورد", icon: Settings, exact: false },
  { href: "/timeline", label: "بازگشت به تقویم", icon: Shield, exact: false },
] as const;

export function RequireAuth({
  children,
  requireManageUsers,
  requireManageSettings,
}: {
  children: ReactNode;
  requireManageUsers?: boolean;
  requireManageSettings?: boolean;
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

    setUser(current);
    setReady(true);
  }, [router, requireManageUsers, requireManageSettings]);

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
            <p className="text-xs text-[var(--text-secondary)]">پنل مدیریت</p>
            <h1 className="mt-1 text-lg font-bold text-[var(--text-primary)]">تقویم دفاعی</h1>
          </div>

          <nav className="flex-1 space-y-1 p-2">
            {NAV.map((item) => {
              if (item.href === "/admin/users" && !perms.manageUsers) return null;
              if (item.href === "/admin/settings" && !perms.manageSettings) {
                return null;
              }

              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
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

          <div className="border-t border-[var(--border)] p-3">
            <ThemeToggle className="mb-3 w-full justify-center" />
            <div className="mb-3 rounded-xl bg-[var(--panel-2)] p-3 text-xs">
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
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs"
            >
              خروج
            </button>
          </div>

          <div className="flex flex-wrap gap-2 lg:hidden">
            {NAV.map((item) => {
              if (item.href === "/admin/users" && !perms.manageUsers) return null;
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
    </div>
  );
}
