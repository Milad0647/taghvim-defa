"use client";

import { CreateEventForm } from "@/components/forms/CreateEventForm";
import { IranEmblem } from "@/components/brand/IranEmblem";
import { SiteMottoBanner } from "@/components/brand/SiteMottoBanner";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { apiFetch, getCurrentUser, logoutRequest } from "@/lib/auth";
import { getSiteBranding } from "@/lib/branding";
import { formatPersianDateLabel } from "@/lib/persian-date";
import { severityLabel } from "@/lib/timeline";
import {
  canViewAdminViews,
  userHasPermission,
  type AdminUser,
} from "@/types/auth";
import type { Severity } from "@/types/timeline";
import {
  Archive,
  Eye,
  LayoutDashboard,
  LogOut,
  Pencil,
  Play,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type MediaItem = {
  id: number | string;
  url: string;
  mime_type?: string | null;
  alt?: string | null;
};

type ContentCreator = {
  id: number;
  name: string;
};

type ContentItem = {
  id: number;
  kind: "enemy" | "government";
  title: string;
  description?: string | null;
  severity?: string | null;
  source?: string | null;
  location?: string | null;
  agency?: string | null;
  status?: string | null;
  date: string;
  occurred_at?: string | null;
  completed_at?: string | null;
  created_by?: number | null;
  agency_id?: string | null;
  tags?: string[];
  creator?: ContentCreator | null;
  media?: MediaItem[];
};

type OwnerFilter = "all" | "mine" | "subordinates";

type ModalMode = "view" | "edit" | null;

function mediaKind(mime?: string | null): "image" | "video" | "audio" | "other" {
  const value = (mime ?? "").toLowerCase();
  if (value.startsWith("image/")) return "image";
  if (value.startsWith("video/")) return "video";
  if (value.startsWith("audio/")) return "audio";
  return "other";
}

/** Prefer first image, otherwise first video — for card cover. */
function getCoverMedia(
  media?: MediaItem[],
): { item: MediaItem; kind: "image" | "video" } | null {
  if (!media?.length) return null;
  const image = media.find((m) => mediaKind(m.mime_type) === "image");
  if (image) return { item: image, kind: "image" };
  const video = media.find((m) => mediaKind(m.mime_type) === "video");
  if (video) return { item: video, kind: "video" };
  return null;
}

function statusLabel(status?: string | null): string {
  switch (status) {
    case "draft":
      return "پیش‌نویس";
    case "pending":
      return "در انتظار";
    case "verified":
      return "تأییدشده";
    case "rejected":
      return "ردشده";
    case "published":
      return "منتشرشده";
    default:
      return status || "—";
  }
}

function itemDate(raw: {
  date?: string | null;
  occurred_at?: string | null;
  completed_at?: string | null;
  calendar_day?: { date?: string | null } | null;
}): string {
  if (raw.date) return raw.date.slice(0, 10);
  if (raw.occurred_at) return raw.occurred_at.slice(0, 10);
  if (raw.completed_at) return raw.completed_at.slice(0, 10);
  if (raw.calendar_day?.date) return raw.calendar_day.date.slice(0, 10);
  return "بدون-تاریخ";
}

export default function MyContentPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>("all");
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [saving, setSaving] = useState(false);
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
      const enemy = (payload.data?.enemy_actions ?? []).map(
        (row: Record<string, unknown>) =>
          normalizeItem(row, "enemy") as ContentItem,
      );
      const government = (payload.data?.government_actions ?? []).map(
        (row: Record<string, unknown>) =>
          normalizeItem(row, "government") as ContentItem,
      );
      setItems([...enemy, ...government]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  function normalizeItem(
    row: Record<string, unknown>,
    kind: "enemy" | "government",
  ): ContentItem {
    return {
      id: Number(row.id),
      kind,
      title: String(row.title ?? ""),
      description: (row.description as string | null) ?? null,
      severity: (row.severity as string | null) ?? null,
      source: (row.source as string | null) ?? null,
      location: (row.location as string | null) ?? null,
      agency: (row.agency as string | null) ?? null,
      status: (row.status as string | null) ?? null,
      date: itemDate(row as Parameters<typeof itemDate>[0]),
      occurred_at: (row.occurred_at as string | null) ?? null,
      completed_at: (row.completed_at as string | null) ?? null,
      created_by: (row.created_by as number | null) ?? null,
      agency_id: (row.agency_id as string | null) ?? null,
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
      creator: (row.creator as ContentCreator | null) ?? null,
      media: Array.isArray(row.media) ? (row.media as MediaItem[]) : [],
    };
  }

  async function onLogout() {
    await logoutRequest();
    router.replace("/login");
  }

  async function onDelete(item: ContentItem) {
    if (
      !window.confirm(
        `حذف «${item.title}»؟ این مورد به آرشیو منتقل می‌شود.`,
      )
    ) {
      return;
    }
    setError(null);
    try {
      const endpoint =
        item.kind === "enemy"
          ? `/enemy-actions/${item.id}`
          : `/government-actions/${item.id}`;
      const res = await apiFetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error("حذف ناموفق بود");
      setItems((prev) =>
        prev.filter((row) => !(row.id === item.id && row.kind === item.kind)),
      );
      if (selected?.id === item.id && selected.kind === item.kind) {
        closeModal();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در حذف");
    }
  }

  async function onSaveEdit(draft: ContentItem) {
    setSaving(true);
    setError(null);
    try {
      const endpoint =
        draft.kind === "enemy"
          ? `/enemy-actions/${draft.id}`
          : `/government-actions/${draft.id}`;
      const body =
        draft.kind === "enemy"
          ? {
              title: draft.title.trim(),
              description: draft.description || null,
              severity: draft.severity || "medium",
              source: draft.source || null,
              location: draft.location || null,
              status: draft.status || "published",
              agency_id: draft.agency_id || null,
            }
          : {
              title: draft.title.trim(),
              description: draft.description || null,
              agency: draft.agency || null,
              status: draft.status || "published",
              tags: draft.tags ?? [],
              agency_id: draft.agency_id || null,
            };
      const res = await apiFetch(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "ذخیره ویرایش ناموفق بود");
      }
      const payload = await res.json();
      const updated = normalizeItem(
        payload.data ?? {},
        draft.kind,
      );
      setItems((prev) =>
        prev.map((row) =>
          row.id === draft.id && row.kind === draft.kind ? updated : row,
        ),
      );
      setSelected(updated);
      setModalMode("view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  }

  function openModal(item: ContentItem, mode: Exclude<ModalMode, null>) {
    setSelected(item);
    setModalMode(mode);
  }

  function closeModal() {
    setSelected(null);
    setModalMode(null);
  }

  const filteredItems = useMemo(() => {
    if (!user) return [];
    return items.filter((item) => {
      const mine = item.created_by === Number(user.id);
      if (ownerFilter === "mine") return mine;
      if (ownerFilter === "subordinates") return !mine;
      return true;
    });
  }, [items, ownerFilter, user]);

  const days = useMemo(() => {
    const map = new Map<string, ContentItem[]>();
    for (const item of filteredItems) {
      const key = item.date || "بدون-تاریخ";
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, dayItems]) => ({
        date,
        items: dayItems.sort((a, b) => {
          if (a.kind !== b.kind) return a.kind === "enemy" ? -1 : 1;
          return a.title.localeCompare(b.title, "fa");
        }),
      }));
  }, [filteredItems]);

  const stats = useMemo(() => {
    if (!user) {
      return { total: 0, mine: 0, subordinates: 0 };
    }
    const mine = items.filter((i) => i.created_by === Number(user.id)).length;
    return {
      total: items.length,
      mine,
      subordinates: items.length - mine,
    };
  }, [items, user]);

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
  const showAdminLink = canViewAdminViews(user);

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
              <p className="text-xs text-[var(--text-secondary)]">
                محتوای من و زیردستان — به‌تفکیک روز
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
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
          {showAdminLink ? (
            <Link
              href="/timeline"
              className="inline-flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              تایم‌لاین
            </Link>
          ) : null}
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

        <section className="grid grid-cols-3 gap-2">
          <StatCard label="کل محتوا" value={stats.total} />
          <StatCard label="ثبت خودم" value={stats.mine} />
          <StatCard label="ثبت زیردستان" value={stats.subordinates} />
        </section>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", `همه (${stats.total})`],
              ["mine", `فقط من (${stats.mine})`],
              ["subordinates", `زیردستان (${stats.subordinates})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setOwnerFilter(key)}
              className={`rounded-xl px-3 py-2 text-xs font-medium ${
                ownerFilter === key
                  ? "bg-blue-600 text-white"
                  : "border border-[var(--border)] bg-[var(--panel)] text-[var(--text-secondary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[var(--text-secondary)]">در حال بارگذاری...</p>
        ) : days.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)] px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
            محتوایی برای نمایش نیست.
          </div>
        ) : (
          <div className="space-y-5">
            {days.map((day) => (
              <section key={day.date} className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      {day.date === "بدون-تاریخ"
                        ? "بدون تاریخ"
                        : formatPersianDateLabel(day.date)}
                    </h2>
                    {day.date !== "بدون-تاریخ" ? (
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {day.date}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-lg bg-[var(--panel-2)] px-2 py-1 text-[11px] text-[var(--text-secondary)]">
                    {day.items.length.toLocaleString("fa-IR")} مورد
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {day.items.map((item) => {
                    const mine = item.created_by === Number(user.id);
                    const isEnemy = item.kind === "enemy";
                    const cover = getCoverMedia(item.media);
                    const mediaCount = item.media?.length ?? 0;
                    return (
                      <article
                        key={`${item.kind}-${item.id}`}
                        className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]"
                      >
                        {cover ? (
                          <div className="relative h-40 w-full shrink-0 bg-[var(--panel-2)]">
                            {cover.kind === "video" ? (
                              <video
                                src={cover.item.url}
                                muted
                                playsInline
                                preload="metadata"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cover.item.url}
                                alt={cover.item.alt ?? ""}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            )}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                            {cover.kind === "video" ? (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm">
                                  <Play className="h-4 w-4 fill-current ps-0.5" />
                                </span>
                              </span>
                            ) : null}
                            {mediaCount > 1 ? (
                              <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                                {mediaCount.toLocaleString("fa-IR")} رسانه
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="flex flex-1 flex-col p-3">
                          <div className="mb-2 flex flex-wrap items-center gap-1.5">
                            <span
                              className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                              style={{
                                background: isEnemy
                                  ? "rgba(220, 38, 38, 0.15)"
                                  : "rgba(37, 99, 235, 0.15)",
                                color: isEnemy
                                  ? "var(--enemy)"
                                  : "var(--government)",
                              }}
                            >
                              {isEnemy ? "اقدام دشمن" : "اقدام دولت"}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] ${
                                mine
                                  ? "bg-emerald-500/15 text-emerald-600"
                                  : "bg-amber-500/15 text-amber-700"
                              }`}
                            >
                              {mine
                                ? "خودم"
                                : `زیردست · ${item.creator?.name || "نامشخص"}`}
                            </span>
                            {item.status ? (
                              <span className="rounded-md bg-[var(--panel-2)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                                {statusLabel(item.status)}
                              </span>
                            ) : null}
                          </div>

                          <h3 className="line-clamp-2 text-sm font-semibold text-[var(--text-primary)]">
                            {item.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-6 text-[var(--text-secondary)]">
                            {item.description || "بدون شرح"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--text-muted)]">
                            {item.severity ? (
                              <span>
                                شدت:{" "}
                                {severityLabel(item.severity as Severity)}
                              </span>
                            ) : null}
                            {mediaCount > 0 && !cover ? (
                              <span>
                                رسانه: {mediaCount.toLocaleString("fa-IR")}
                              </span>
                            ) : null}
                            {item.location ? <span>{item.location}</span> : null}
                          </div>

                          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                            <ActionButton
                              label="مشاهده"
                              icon={<Eye className="h-3.5 w-3.5" />}
                              onClick={() => openModal(item, "view")}
                            />
                            {canManage ? (
                              <>
                                <ActionButton
                                  label="ویرایش"
                                  icon={<Pencil className="h-3.5 w-3.5" />}
                                  onClick={() => openModal(item, "edit")}
                                />
                                <ActionButton
                                  label="حذف"
                                  icon={<Trash2 className="h-3.5 w-3.5" />}
                                  danger
                                  onClick={() => void onDelete(item)}
                                />
                              </>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
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

      {selected && modalMode ? (
        <ContentModal
          item={selected}
          mode={modalMode}
          saving={saving}
          canManage={canManage}
          onClose={closeModal}
          onEdit={() => setModalMode("edit")}
          onDelete={() => void onDelete(selected)}
          onSave={(draft) => void onSaveEdit(draft)}
        />
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-3 py-3">
      <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">
        {value.toLocaleString("fa-IR")}
      </p>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
  danger = false,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] ${
        danger
          ? "border-red-500/30 text-red-500 hover:bg-red-500/10"
          : "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--hover)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ContentModal({
  item,
  mode,
  saving,
  canManage,
  onClose,
  onEdit,
  onDelete,
  onSave,
}: {
  item: ContentItem;
  mode: "view" | "edit";
  saving: boolean;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (draft: ContentItem) => void;
}) {
  const [draft, setDraft] = useState(item);

  useEffect(() => {
    setDraft(item);
  }, [item, mode]);

  const isEnemy = draft.kind === "enemy";

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 md:inset-y-8 md:left-1/2 md:right-auto md:w-[560px] md:-translate-x-1/2 md:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--text-secondary)]">
              {mode === "edit" ? "ویرایش محتوا" : "مشاهده محتوا"}
            </p>
            <h3 className="mt-1 text-base font-bold text-[var(--text-primary)]">
              {item.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-[var(--hover)]"
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {mode === "view" ? (
          <div className="space-y-3 text-sm">
            <MetaRow
              label="نوع"
              value={isEnemy ? "اقدام دشمن" : "اقدام دولت"}
            />
            <MetaRow
              label="ثبت‌کننده"
              value={
                item.creator?.name
                  ? item.creator.name
                  : item.created_by
                    ? `#${item.created_by}`
                    : "—"
              }
            />
            <MetaRow
              label="تاریخ"
              value={
                item.date === "بدون-تاریخ"
                  ? "—"
                  : formatPersianDateLabel(item.date)
              }
            />
            <MetaRow label="وضعیت" value={statusLabel(item.status)} />
            {item.severity ? (
              <MetaRow
                label="شدت"
                value={severityLabel(item.severity as Severity)}
              />
            ) : null}
            {item.location ? (
              <MetaRow label="محل" value={item.location} />
            ) : null}
            {item.source ? <MetaRow label="منبع" value={item.source} /> : null}
            {item.agency ? (
              <MetaRow label="نهاد" value={item.agency} />
            ) : null}
            <div>
              <p className="text-[11px] text-[var(--text-muted)]">شرح</p>
              <p className="mt-1 leading-7 text-[var(--text-secondary)]">
                {item.description || "—"}
              </p>
            </div>
            {(item.media?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] text-[var(--text-muted)]">رسانه</p>
                <div className="grid grid-cols-2 gap-2">
                  {item.media!.map((media) => {
                    const kind = mediaKind(media.mime_type);
                    return (
                      <div
                        key={String(media.id)}
                        className="overflow-hidden rounded-xl border border-[var(--border)]"
                      >
                        {kind === "video" ? (
                          <video
                            src={media.url}
                            controls
                            className="h-28 w-full bg-black object-cover"
                          />
                        ) : kind === "audio" ? (
                          <div className="flex h-28 items-center bg-[var(--panel)] px-3">
                            <audio src={media.url} controls className="w-full" />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media.url}
                            alt={media.alt ?? ""}
                            className="h-28 w-full object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <Field
              label="عنوان"
              value={draft.title}
              onChange={(v) => setDraft((d) => ({ ...d, title: v }))}
            />
            <label className="block space-y-1.5">
              <span className="text-xs text-[var(--text-secondary)]">شرح</span>
              <textarea
                value={draft.description ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
                rows={4}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            {isEnemy ? (
              <>
                <SelectField
                  label="شدت"
                  value={draft.severity || "medium"}
                  onChange={(v) => setDraft((d) => ({ ...d, severity: v }))}
                  options={[
                    { value: "low", label: "کم" },
                    { value: "medium", label: "متوسط" },
                    { value: "high", label: "شدید" },
                    { value: "critical", label: "بحرانی" },
                  ]}
                />
                <Field
                  label="منبع"
                  value={draft.source ?? ""}
                  onChange={(v) => setDraft((d) => ({ ...d, source: v }))}
                />
                <Field
                  label="محل"
                  value={draft.location ?? ""}
                  onChange={(v) => setDraft((d) => ({ ...d, location: v }))}
                />
              </>
            ) : (
              <Field
                label="نهاد / سازمان"
                value={draft.agency ?? ""}
                onChange={(v) => setDraft((d) => ({ ...d, agency: v }))}
              />
            )}
            <SelectField
              label="وضعیت"
              value={draft.status || "published"}
              onChange={(v) => setDraft((d) => ({ ...d, status: v }))}
              options={[
                { value: "draft", label: "پیش‌نویس" },
                { value: "pending", label: "در انتظار" },
                { value: "published", label: "منتشرشده" },
                { value: "rejected", label: "ردشده" },
              ]}
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
          >
            بستن
          </button>
          {mode === "view" && canManage ? (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                ویرایش
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-500"
              >
                حذف
              </button>
            </>
          ) : null}
          {mode === "edit" ? (
            <button
              type="button"
              disabled={saving || !draft.title.trim()}
              onClick={() => onSave(draft)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-[var(--text-muted)]">{label}</span>
      <span className="text-left text-[13px] text-[var(--text-primary)]">
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
