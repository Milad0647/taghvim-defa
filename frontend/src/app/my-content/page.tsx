"use client";

import { CreateEventForm } from "@/components/forms/CreateEventForm";
import { IranEmblem } from "@/components/brand/IranEmblem";
import { SiteMottoBanner } from "@/components/brand/SiteMottoBanner";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { apiFetch, getCurrentUser, logoutRequest } from "@/lib/auth";
import { getSiteBranding } from "@/lib/branding";
import {
  userHasPermission,
  type AdminUser,
} from "@/types/auth";
import { Archive, FileText, LogOut, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ContentItem = {
  id: number;
  title: string;
  created_by?: number | null;
  status?: string;
};

export default function MyContentPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [enemy, setEnemy] = useState<ContentItem[]>([]);
  const [government, setGovernment] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [branding, setBranding] = useState(() => getSiteBranding());

  useEffect(() => {
    setBranding(getSiteBranding());
    const current = getCurrentUser();
    if (!current) {
      router.replace("/login");
      return;
    }
    setUser(current);
    void loadContent();
  }, [router]);

  async function loadContent() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/my-content");
      if (!res.ok) throw new Error("بارگذاری محتوا ناموفق بود");
      const payload = await res.json();
      setEnemy(payload.data?.enemy_actions ?? []);
      setGovernment(payload.data?.government_actions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    await logoutRequest();
    router.replace("/login");
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--text-secondary)]">
        در حال بارگذاری...
      </div>
    );
  }

  const canManage = userHasPermission(user, "manage_content");
  const canSubusers = userHasPermission(user, "manage_subusers");
  const canArchive = userHasPermission(user, "view_archive");

  return (
    <div
      className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]"
      style={{ direction: "rtl" }}
    >
      <header className="border-b border-[var(--border)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <IranEmblem className="h-8 w-8 text-[var(--logo)]" />
            <div>
              <h1 className="text-lg font-bold">{branding.siteTitle}</h1>
              <p className="text-xs text-[var(--text-secondary)]">محتوای من و زیردستان</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {canManage ? (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                ثبت رویداد
              </button>
            ) : null}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 p-4">
        <SiteMottoBanner compact />

        <div className="flex flex-wrap gap-2">
          {canSubusers ? (
            <Link
              href="/my-subusers"
              className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs"
            >
              <Users className="h-3.5 w-3.5" />
              زیردستان من
            </Link>
          ) : null}
          {canArchive ? (
            <Link
              href="/admin/archive"
              className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs"
            >
              <Archive className="h-3.5 w-3.5" />
              آرشیو
            </Link>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[var(--text-secondary)]">در حال بارگذاری...</p>
        ) : (
          <>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4" />
                اقدامات دشمن ({enemy.length})
              </h2>
              <ul className="space-y-2">
                {enemy.length === 0 ? (
                  <li className="text-sm text-[var(--text-secondary)]">موردی نیست</li>
                ) : (
                  enemy.map((item) => (
                    <li
                      key={`e-${item.id}`}
                      className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm"
                    >
                      {item.title}
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <h2 className="mb-3 text-sm font-semibold">
                اقدامات دولت ({government.length})
              </h2>
              <ul className="space-y-2">
                {government.length === 0 ? (
                  <li className="text-sm text-[var(--text-secondary)]">موردی نیست</li>
                ) : (
                  government.map((item) => (
                    <li
                      key={`g-${item.id}`}
                      className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm"
                    >
                      {item.title}
                    </li>
                  ))
                )}
              </ul>
            </section>
          </>
        )}
      </main>

      {canManage ? (
        <CreateEventForm
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            void loadContent();
          }}
        />
      ) : null}
    </div>
  );
}
