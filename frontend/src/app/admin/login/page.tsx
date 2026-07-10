"use client";

import { API_BASE } from "@/lib/api";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@taghvim.local");
  const [password, setPassword] = useState("password");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "ورود ناموفق بود");
      }

      setToken(payload.token);
      localStorage.setItem("taghvim_token", payload.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl border border-white/10 bg-[#121a2e]/90 p-6 shadow-2xl backdrop-blur">
        <h1 className="text-2xl font-bold text-white">ورود پنل مدیریت</h1>
        <p className="mt-2 text-sm text-slate-400">
          برای ثبت روز و اقدامات از این بخش وارد شوید.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span className="text-slate-300">ایمیل</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 outline-none ring-violet-500 focus:ring-2"
              required
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="text-slate-300">رمز عبور</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 outline-none ring-violet-500 focus:ring-2"
              required
            />
          </label>

          {error ? (
            <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {token ? (
            <p className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-200">
              ورود موفق — توکن ذخیره شد. می‌توانید از API برای ثبت داده استفاده
              کنید.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-l from-violet-600 to-fuchsia-500 px-4 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </div>
    </main>
  );
}
