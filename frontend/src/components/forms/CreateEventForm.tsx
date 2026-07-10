"use client";

import type { EventType, Severity } from "@/types/timeline";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type CreateEventFormProps = {
  open: boolean;
  onClose: () => void;
};

const STEPS = [
  "اطلاعات اصلی",
  "مکان و زمان",
  "رسانه و منبع",
  "ارتباط‌ها",
  "مرور و انتشار",
] as const;

export function CreateEventForm({ open, onClose }: CreateEventFormProps) {
  const [step, setStep] = useState(0);
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
    organization: "",
    source: "",
    tags: "",
  });

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
            <h3 className="text-lg font-bold text-white">ثبت رویداد جدید</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              مرحله {(step + 1).toLocaleString("fa-IR")} از{" "}
              {STEPS.length.toLocaleString("fa-IR")}: {STEPS[step]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-white/5"
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
                label="نوع رویداد"
                value={draft.eventType}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, eventType: v as EventType }))
                }
                options={[
                  { value: "enemy", label: "اقدام دشمن" },
                  { value: "government", label: "اقدام دولت" },
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
              <Field
                label="تاریخ"
                type="date"
                value={draft.date}
                onChange={(v) => setDraft((d) => ({ ...d, date: v }))}
              />
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
                label="نهاد مرتبط"
                value={draft.organization}
                onChange={(v) => setDraft((d) => ({ ...d, organization: v }))}
              />
              <Field
                label="تگ‌ها (با ویرگول)"
                value={draft.tags}
                onChange={(v) => setDraft((d) => ({ ...d, tags: v }))}
              />
              <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-xs text-slate-400">
                آپلود تصویر / ویدئو / سند در اتصال به API فعال می‌شود.
              </p>
            </>
          ) : null}

          {step === 3 ? (
            <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-3)] p-4 text-sm text-slate-300">
              می‌توانید پس از ثبت، رخداد را به پاسخ‌های مرتبط یا رخدادهای دیگر
              متصل کنید.
            </p>
          ) : null}

          {step === 4 ? (
            <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] p-4 text-sm text-slate-300">
              <p>
                <strong className="text-white">عنوان:</strong> {draft.title || "—"}
              </p>
              <p>
                <strong className="text-white">نوع:</strong>{" "}
                {draft.eventType === "enemy" ? "دشمن" : "دولت"}
              </p>
              <p>
                <strong className="text-white">زمان:</strong> {draft.date} {draft.time}
              </p>
              <p>
                <strong className="text-white">مکان:</strong> {draft.city} {draft.province}
              </p>
              <p className="text-xs text-emerald-300">پیش‌نویس به‌صورت خودکار ذخیره شد.</p>
            </div>
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
              className="rounded-xl bg-[var(--purple)] px-4 py-2 text-sm font-semibold text-white"
            >
              بعدی
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("taghvim_event_draft");
                onClose();
              }}
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
      <span className="text-xs text-slate-400">{label}</span>
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
      <span className="text-xs text-slate-400">{label}</span>
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
      <span className="text-xs text-slate-400">{label}</span>
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
