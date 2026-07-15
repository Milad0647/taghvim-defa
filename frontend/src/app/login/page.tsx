"use client";

import { loginRequest } from "@/lib/auth";
import { getSession } from "@/lib/admin-store";
import { IranEmblem } from "@/components/brand/IranEmblem";
import { getSiteBranding, SITE_TAGLINE, SITE_TITLE } from "@/lib/branding";
import { canViewAdminViews } from "@/lib/auth";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Stable SSR/CSR defaults — avoid localStorage during first paint (hydration #418)
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
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{
        direction: "rtl",
        backgroundImage:
          "linear-gradient(rgba(8, 12, 20, 0.72), rgba(8, 12, 20, 0.82)), url(/login-bg.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel)]/95 p-6 shadow-2xl backdrop-blur-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--hover)]">
            <IranEmblem className="h-7 w-7 text-[var(--logo)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              ورود به سامانه
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {branding.siteTitle} — {branding.siteTagline}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span className="text-[var(--text-secondary)]">نام کاربری</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
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
      </div>
    </main>
  );
}
