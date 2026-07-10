"use client";

import { loginRequest } from "@/lib/auth";
import { getSession } from "@/lib/admin-store";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { IranEmblem } from "@/components/brand/IranEmblem";
import { getSiteBranding } from "@/lib/branding";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@taghvim.local");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState(() => getSiteBranding());

  useEffect(() => {
    setBranding(getSiteBranding());
    if (getSession()) {
      router.replace("/admin");
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginRequest(email, password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-[var(--background)] px-4"
      style={{ direction: "rtl" }}
    >
      <div className="absolute top-4 left-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--hover)]">
            <IranEmblem className="h-7 w-7 text-[var(--logo)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              ورود به پنل مدیریت
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {branding.siteTitle} — {branding.siteTagline}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--text-secondary)]">ایمیل</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2.5 text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--text-secondary)]">رمز عبور</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2.5 text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          {error ? (
            <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] p-3 text-xs text-[var(--text-secondary)]">
          <p className="mb-1 font-medium text-[var(--text-secondary)]">حساب‌های نمونه:</p>
          <p>admin@taghvim.local / password</p>
          <p>editor@taghvim.local / password</p>
          <p>viewer@taghvim.local / password</p>
        </div>

        <Link
          href="/timeline"
          className="mt-4 block text-center text-sm text-[var(--primary)] hover:underline"
        >
          بازگشت به خط زمانی
        </Link>
      </div>
    </main>
  );
}
