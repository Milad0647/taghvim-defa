"use client";

import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { getAgencyById, listAgencies } from "@/lib/agency-store";
import { getCurrentUser } from "@/lib/auth";
import { upsertTimelineEvent } from "@/lib/timeline-store";
import type { GovernmentAgency } from "@/types/agency";
import { ROLE_PERMISSIONS } from "@/types/auth";
import type { EventType, Severity, TimelineEvent } from "@/types/timeline";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CreateEventFormProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (event: TimelineEvent) => void;
};

const STEPS = [
  "اطلاعات اصلی",
  "مکان و زمان",
  "رسانه و منبع",
  "ارتباط‌ها",
  "مرور و انتشار",
] as const;

export function CreateEventForm({
  open,
  onClose,
  onCreated,
}: CreateEventFormProps) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [allowedAgencies, setAllowedAgencies] = useState<GovernmentAgency[]>(
    [],
  );
  const [draft, setDraft] = useState({
    eventType: "enemy" as EventType,
    title: "",
    summary: "",
    description: "",
    date: "",
    time: "",
    province: "",
    city: "",
    category: "",
    severity: "medium" as Severity,
    agencyId: "",
    organization: "",
    source: "",
    tags: "",
  });

  const agencyOptions = useMemo(() => allowedAgencies, [allowedAgencies]);

  useEffect(() => {
    if (!open) return;
    const user = getCurrentUser();
    const all = listAgencies({ activeOnly: true });
    const scoped =
      !user ||
      user.role === "super_admin" ||
      !user.agencyIds?.length
        ? all
        : all.filter((a) => user.agencyIds.includes(a.id));
    setAllowedAgencies(scoped);
    setDraft((d) => ({
      ...d,
      agencyId: d.agencyId || scoped[0]?.id || "",
    }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem("taghvim_event_draft");
    if (saved) {
      try {
        setDraft((d) => ({ ...d, ...JSON.parse(saved) }));
      } catch {
        // ignore
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    localStorage.setItem("taghvim_event_draft", JSON.stringify(draft));
  }, [draft, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function publish() {
    setError(null);
    const user = getCurrentUser();
    if (!user || !ROLE_PERMISSIONS[user.role].manageContent) {
      setError("اجازه ثبت محتوا ندارید.");
      return;
    }
    if (!draft.title.trim() || !draft.date || !draft.time) {
      setError("عنوان، تاریخ و ساعت الزامی است.");
      return;
    }
    if (!draft.agencyId) {
      setError("وزارتخانه / بخش دولت را انتخاب کنید.");
      return;
    }
    if (
      user.role !== "super_admin" &&
      user.agencyIds?.length &&
      !user.agencyIds.includes(draft.agencyId)
    ) {
      setError("به این وزارتخانه دسترسی ندارید.");
      return;
    }

    const agency = getAgencyById(draft.agencyId);
    const now = new Date().toISOString();
    const event: TimelineEvent = {
      id: `evt-${Date.now()}`,
      eventType: draft.eventType,
      title: draft.title.trim(),
      summary: draft.summary.trim() || draft.title.trim(),
      description: draft.description.trim() || undefined,
      date: draft.date,
      time: draft.time,
      severity: draft.severity,
      verificationStatus: "published",
      actionStatus:
        draft.eventType === "government" ? "in_progress" : undefined,
      category: draft.category.trim() || agency?.shortName || "عمومی",
      location: {
        province: draft.province.trim() || undefined,
        city: draft.city.trim() || undefined,
      },
      organization:
        draft.organization.trim() || agency?.shortName || undefined,
      agencyId: draft.agencyId,
      agencyName: agency?.name,
      source: draft.source.trim() || undefined,
      tags: draft.tags
        .split(/[,،]/)
        .map((t) => t.trim())
        .filter(Boolean),
      relatedEventIds: [],
      relatedResponseIds: [],
      commentsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    upsertTimelineEvent(event);
    localStorage.removeItem("taghvim_event_draft");
    onCreated?.(event);
    onClose();
    setStep(0);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="بستن فرم"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 md:inset-y-6 md:left-1/2 md:right-auto md:w-[560px] md:-translate-x-1/2 md:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              ثبت رویداد جدید
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              مرحله {(step + 1).toLocaleString("fa-IR")} از{" "}
              {STEPS.length.toLocaleString("fa-IR")}: {STEPS[step]}
            </p>
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

        <div className="mb-4 flex gap-1">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-[var(--purple)]" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="space-y-3 text-sm">
          {step === 0 ? (
            <>
              <Select
                label="وزارتخانه / بخش دولت"
                value={draft.agencyId}
                onChange={(v) => setDraft((d) => ({ ...d, agencyId: v }))}
                options={agencyOptions.map((a) => ({
                  value: a.id,
                  label: a.shortName,
                }))}
              />
              <Select
                label="نوع رویداد"
                value={draft.eventType}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, eventType: v as EventType }))
                }
                options={[
                  { value: "enemy", label: "اقدام دشمن (مرتبط با این بخش)" },
                  { value: "government", label: "اقدام دولت / این وزارتخانه" },
                ]}
              />
              <Field
                label="عنوان"
                value={draft.title}
                onChange={(v) => setDraft((d) => ({ ...d, title: v }))}
              />
              <TextArea
                label="خلاصه"
                value={draft.summary}
                onChange={(v) => setDraft((d) => ({ ...d, summary: v }))}
              />
              <TextArea
                label="شرح کامل"
                value={draft.description}
                onChange={(v) => setDraft((d) => ({ ...d, description: v }))}
              />
              <Select
                label="شدت"
                value={draft.severity}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, severity: v as Severity }))
                }
                options={[
                  { value: "low", label: "کم" },
                  { value: "medium", label: "متوسط" },
                  { value: "high", label: "شدید" },
                  { value: "critical", label: "بحرانی" },
                ]}
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div className="space-y-1.5">
                <span className="text-xs text-[var(--text-secondary)]">تاریخ</span>
                <PersianDatePicker
                  value={draft.date}
                  onChange={(date) => setDraft((d) => ({ ...d, date }))}
                  placeholder="انتخاب تاریخ شمسی"
                  ariaLabel="تاریخ رویداد"
                  allowClear={false}
                />
              </div>
              <Field
                label="ساعت"
                type="time"
                value={draft.time}
                onChange={(v) => setDraft((d) => ({ ...d, time: v }))}
              />
              <Field
                label="استان"
                value={draft.province}
                onChange={(v) => setDraft((d) => ({ ...d, province: v }))}
              />
              <Field
                label="شهر"
                value={draft.city}
                onChange={(v) => setDraft((d) => ({ ...d, city: v }))}
              />
              <Field
                label="دسته‌بندی"
                value={draft.category}
                onChange={(v) => setDraft((d) => ({ ...d, category: v }))}
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Field
                label="منبع"
                value={draft.source}
                onChange={(v) => setDraft((d) => ({ ...d, source: v }))}
              />
              <Field
                label="نهاد اجرایی (اختیاری)"
                value={draft.organization}
                onChange={(v) => setDraft((d) => ({ ...d, organization: v }))}
              />
              <Field
                label="تگ‌ها (با ویرگول)"
                value={draft.tags}
                onChange={(v) => setDraft((d) => ({ ...d, tags: v }))}
              />
              <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-xs text-[var(--text-secondary)]">
                آپلود تصویر / ویدئو / سند در اتصال به API فعال می‌شود.
              </p>
            </>
          ) : null}

          {step === 3 ? (
            <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-3)] p-4 text-sm text-[var(--text-secondary)]">
              می‌توانید پس از ثبت، رخداد را به پاسخ‌های مرتبط یا رخدادهای دیگر
              متصل کنید.
            </p>
          ) : null}

          {step === 4 ? (
            <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] p-4 text-sm text-[var(--text-secondary)]">
              <p>
                <strong className="text-[var(--text-primary)]">عنوان:</strong>{" "}
                {draft.title || "—"}
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">وزارتخانه:</strong>{" "}
                {getAgencyById(draft.agencyId)?.shortName || "—"}
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">نوع:</strong>{" "}
                {draft.eventType === "enemy" ? "دشمن" : "دولت"}
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">زمان:</strong>{" "}
                {draft.date} {draft.time}
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">مکان:</strong>{" "}
                {draft.city} {draft.province}
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
            >
              قبلی
            </button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl bg-[var(--purple)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
            >
              بعدی
            </button>
          ) : (
            <button
              type="button"
              onClick={publish}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              انتشار / ثبت
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function TextArea({
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.length === 0 ? (
          <option value="">وزارتخانه‌ای تعریف نشده</option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
