"use client";

import { RequireAuth } from "@/components/admin/RequireAuth";
import { getCurrentUser } from "@/lib/auth";
import {
  clearAllDemoData,
  getDemoDataStats,
  restoreConflictDemoData,
} from "@/lib/timeline-store";
import { ROLE_LABELS, userHasPermission } from "@/types/auth";
import { Eraser, RotateCcw } from "lucide-react";
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
  const [canContent, setCanContent] = useState(false);
  const [canArchive, setCanArchive] = useState(false);
  const [canBackup, setCanBackup] = useState(false);
  const [canForm, setCanForm] = useState(false);
  const [stats, setStats] = useState({ days: 0, events: 0, cleared: false });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    setName(user.name);
    setRoleLabel(ROLE_LABELS[user.role]);
    setCanUsers(userHasPermission(user, "manage_users"));
    setCanSettings(userHasPermission(user, "manage_settings"));
    setCanContent(userHasPermission(user, "manage_content"));
    setCanArchive(userHasPermission(user, "view_archive"));
    setCanBackup(userHasPermission(user, "run_backup"));
    setCanForm(userHasPermission(user, "manage_form_schema"));
    setStats(getDemoDataStats());
  }, []);

  function refreshStats() {
    setStats(getDemoDataStats());
  }

  function handleClear() {
    if (
      !window.confirm(
        "همه داده‌های نمونه رویدادها، پیش‌نویس‌ها و فیلترهای ذخیره‌شده پاک می‌شود. این کار برای آماده‌سازی محصول خالی است. ادامه می‌دهید؟",
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      const result = clearAllDemoData();
      refreshStats();
      setMessage(
        `پاک شد: ${result.timelineCount.toLocaleString("fa-IR")} روز داده نمونه و کلیدهای محلی مرتبط. داشبورد اکنون خالی و آماده استفاده واقعی است.`,
      );
    } finally {
      setBusy(false);
    }
  }

  function handleRestore() {
    if (
      !window.confirm(
        "داده نمونه جنگ ۲۰۲۶ از ۹ اسفند ۱۴۰۴ تا امروز دوباره بارگذاری شود؟",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      restoreConflictDemoData();
      refreshStats();
      setMessage("داده نمونه خبری دوباره بارگذاری شد.");
    } finally {
      setBusy(false);
    }
  }

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
              سلسله‌مراتب کاربران و تفویض مجوزها
            </p>
          </Link>
        ) : null}

        {canUsers ? (
          <Link
            href="/admin/agencies"
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-blue-500/30"
          >
            <h3 className="font-semibold text-[var(--text-primary)]">وزارتخانه‌ها</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              تعریف بخش‌های دولت مثل بهداشت، دفاع، امور خارجه برای ثبت داده جداگانه
            </p>
          </Link>
        ) : null}

        {canForm ? (
          <Link
            href="/admin/form-builder"
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-blue-500/30"
          >
            <h3 className="font-semibold text-[var(--text-primary)]">فرم‌ساز رویداد</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              افزودن و مدیریت فیلدهای فرم ثبت رویداد
            </p>
          </Link>
        ) : null}

        {canArchive ? (
          <Link
            href="/admin/archive"
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-blue-500/30"
          >
            <h3 className="font-semibold text-[var(--text-primary)]">آرشیو</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              بازیابی یا حذف دائم موارد soft-delete شده
            </p>
          </Link>
        ) : null}

        {canBackup ? (
          <Link
            href="/admin/backup"
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 transition hover:border-blue-500/30"
          >
            <h3 className="font-semibold text-[var(--text-primary)]">بکاپ پایگاه داده</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              تهیه و دانلود نسخه پشتیبان PostgreSQL
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
            بازگشت به صفحه گزارش زنده
          </p>
        </Link>
      </div>

      {canContent ? (
        <section className="rounded-2xl border border-red-500/25 bg-[var(--panel)] p-5">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            داده نمونه و آماده‌سازی محصول
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            رویدادهای فعلی بر اساس گزارش‌های عمومی جنگ ۲۰۲۶ از{" "}
            <strong className="text-[var(--text-primary)]">۹ اسفند ۱۴۰۴</strong>{" "}
            تا{" "}
            <strong className="text-[var(--text-primary)]">امروز (۱۹ تیر ۱۴۰۵)</strong>{" "}
            برای نمایش دمو پر شده‌اند. قبل از بهره‌برداری واقعی، همه را پاک کنید تا
            داشبورد خالی شود.
          </p>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            وضعیت:{" "}
            {stats.cleared
              ? "خالی / آماده استفاده"
              : `${stats.days.toLocaleString("fa-IR")} روز · ${stats.events.toLocaleString("fa-IR")} رویداد`}
          </p>

          {message ? (
            <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-xs text-[var(--text-primary)]">
              {message}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || (stats.cleared && stats.events === 0)}
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eraser className="h-4 w-4" />
              پاک کردن همه داده‌های نمونه
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleRestore}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--hover)] disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              بازیابی داده خبری نمونه
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
