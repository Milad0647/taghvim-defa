"use client";

import { RequireAuth } from "@/components/admin/RequireAuth";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/types/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminHomePage() {
  return (
    <RequireAuth>
      <AdminHomeContent />
    </RequireAuth>
  );
}

function AdminHomeContent() {
  const [name, setName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [canUsers, setCanUsers] = useState(false);
  const [canSettings, setCanSettings] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    setName(user.name);
    setRoleLabel(ROLE_LABELS[user.role]);
    setCanUsers(ROLE_PERMISSIONS[user.role].manageUsers);
    setCanSettings(ROLE_PERMISSIONS[user.role].manageSettings);
  }, []);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">سلام، {name}</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          نقش شما: {roleLabel}. از این بخش کاربران و تنظیمات داشبورد را مدیریت
          کنید.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {canUsers ? (
          <Link
            href="/admin/users"
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-blue-500/30"
          >
            <h3 className="font-semibold text-[var(--text-primary)]">کاربران و دسترسی‌ها</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              ساخت کاربر جدید، تغییر نقش، فعال/غیرفعال کردن حساب
            </p>
          </Link>
        ) : null}

        {canSettings ? (
          <Link
            href="/admin/settings"
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-blue-500/30"
          >
            <h3 className="font-semibold text-[var(--text-primary)]">تنظیمات داشبورد</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              بازه روز اول تا روز آخر، عنوان سایت، نمای پیش‌فرض
            </p>
          </Link>
        ) : null}

        <Link
          href="/timeline"
          className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-blue-500/30 sm:col-span-2"
        >
          <h3 className="font-semibold text-[var(--text-primary)]">مشاهده خط زمانی</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            بازگشت به صفحه عمومی گزارش زنده
          </p>
        </Link>
      </div>
    </div>
  );
}
