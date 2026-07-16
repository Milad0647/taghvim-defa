"use client";

import { IranEmblem } from "@/components/brand/IranEmblem";
import { getSiteBranding, SITE_TAGLINE, SITE_TITLE } from "@/lib/branding";
import { canViewAdminViews, loginRequest } from "@/lib/auth";
import { getSession } from "@/lib/admin-store";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState({
    siteTitle: SITE_TITLE,
    siteTagline: SITE_TAGLINE,
  });

  useEffect(() => {
    applyTheme("dark");
    return () => {
      applyTheme(getStoredTheme());
    };
  }, []);

  useEffect(() => {
    const b = getSiteBranding();
    setBranding({ siteTitle: b.siteTitle, siteTagline: b.siteTagline });
    const session = getSession();
    if (session) {
      router.replace(
        canViewAdminViews(session.user) ? "/timeline" : "/my-content",
      );
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await loginRequest(username, password);
      router.replace(
        canViewAdminViews(session.user) ? "/timeline" : "/my-content",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "ورود ناموفق بود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{ direction: "rtl" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/login-bg.webp)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/55"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]"
      />

      <div className="relative w-full max-w-[420px]">
        <div className="rounded-[28px] border border-white/25 bg-white/[0.12] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl backdrop-saturate-150">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-inner backdrop-blur-md">
              <IranEmblem className="h-8 w-8 text-white/95" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[1.35rem] font-semibold tracking-tight text-white">
                ورود به سامانه
              </h1>
              <p className="mt-1 truncate text-sm text-white/65">
                {branding.siteTitle} — {branding.siteTagline}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-white/75">نام کاربری</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                autoComplete="username"
                placeholder="نام کاربری خود را وارد کنید"
                className="w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-white/35 outline-none backdrop-blur-md transition focus:border-white/40 focus:bg-black/30 focus:ring-2 focus:ring-white/15"
                required
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium text-white/75">رمز عبور</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="رمز عبور"
                className="w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-white/35 outline-none backdrop-blur-md transition focus:border-white/40 focus:bg-black/30 focus:ring-2 focus:ring-white/15"
                required
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-red-300/25 bg-red-500/20 px-4 py-2.5 text-sm text-red-100 backdrop-blur-md">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0A84FF] py-3.5 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(10,132,255,0.45)] transition hover:bg-[#0077ED] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? "در حال ورود..." : "ورود"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/45">
          سامانه مدیریت تقویم دفاعی
        </p>
      </div>
    </main>
  );
}
