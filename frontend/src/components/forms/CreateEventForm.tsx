"use client";

import { PersianDatePicker } from "@/components/shared/PersianDatePicker";
import { getAgencyById, listAgencies } from "@/lib/agency-store";
import { apiFetch, getCurrentUser } from "@/lib/auth";
import { upsertTimelineEvent } from "@/lib/timeline-store";
import type { GovernmentAgency } from "@/types/agency";
import { userHasPermission } from "@/types/auth";
import type { EventType, Severity, TimelineEvent } from "@/types/timeline";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SchemaField = {
  key: string;
  label: string;
  type: string;
  options: Array<{ value: string; label: string }> | null;
  required: boolean;
  section: string;
  is_system: boolean;
  is_active: boolean;
};

type CreateEventFormProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (event: TimelineEvent) => void;
};

const SYSTEM_KEYS = new Set([
  "eventType",
  "title",
  "summary",
  "date",
  "severity",
  "description",
  "location",
  "source",
]);

export function CreateEventForm({
  open,
  onClose,
  onCreated,
}: CreateEventFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [allowedAgencies, setAllowedAgencies] = useState<GovernmentAgency[]>([]);
  const [values, setValues] = useState<Record<string, string>>({
    eventType: "enemy",
    title: "",
    summary: "",
    description: "",
    date: "",
    time: "12:00",
    severity: "medium",
    agencyId: "",
    source: "",
    location: "",
  });

  const agencyOptions = useMemo(() => allowedAgencies, [allowedAgencies]);
  const activeFields = useMemo(
    () => fields.filter((f) => f.is_active !== false),
    [fields],
  );

  useEffect(() => {
    if (!open) return;
    const user = getCurrentUser();
    const all = listAgencies({ activeOnly: true });
    const scoped =
      !user || user.role === "super_admin" || !user.agencyIds?.length
        ? all
        : all.filter((a) => user.agencyIds.includes(a.id));
    setAllowedAgencies(scoped);
    setValues((d) => ({
      ...d,
      agencyId: d.agencyId || scoped[0]?.id || "",
    }));

    void (async () => {
      try {
        const res = await apiFetch("/form-schema");
        if (!res.ok) return;
        const payload = await res.json();
        setFields(payload.data?.fields ?? []);
      } catch {
        // keep defaults
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function publish() {
    setError(null);
    const user = getCurrentUser();
    if (!user || !userHasPermission(user, "manage_content")) {
      setError("اجازه ثبت محتوا ندارید.");
      return;
    }

    for (const field of activeFields) {
      if (field.required && !String(values[field.key] ?? "").trim()) {
        setError(`فیلد «${field.label}» الزامی است.`);
        return;
      }
    }

    if (!values.title?.trim() || !values.date) {
      setError("عنوان و تاریخ الزامی است.");
      return;
    }
    if (!values.agencyId) {
      setError("وزارتخانه / بخش دولت را انتخاب کنید.");
      return;
    }

    const customFields: Record<string, string> = {};
    for (const field of activeFields) {
      if (!SYSTEM_KEYS.has(field.key) && values[field.key]) {
        customFields[field.key] = values[field.key]!;
      }
    }

    const agency = getAgencyById(values.agencyId);
    const eventType = (values.eventType as EventType) || "enemy";
    const now = new Date().toISOString();
    const event: TimelineEvent = {
      id: `evt-${Date.now()}`,
      eventType,
      title: values.title.trim(),
      summary: (values.summary || values.title).trim(),
      description: values.description?.trim() || undefined,
      date: values.date,
      time: values.time || "12:00",
      severity: (values.severity as Severity) || "medium",
      verificationStatus: "published",
      actionStatus: eventType === "government" ? "in_progress" : undefined,
      category: agency?.shortName || "عمومی",
      location: {
        province: values.location?.trim() || undefined,
      },
      organization: agency?.shortName,
      agencyId: values.agencyId,
      agencyName: agency?.name,
      source: values.source?.trim() || undefined,
      tags: [],
      relatedEventIds: [],
      relatedResponseIds: [],
      commentsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Persist to API when possible
    try {
      const dayRes = await apiFetch("/days", {
        method: "POST",
        body: JSON.stringify({
          date: values.date,
          title: values.title.trim(),
          summary: values.summary || null,
          status: "published",
        }),
      });

      let dayId: number | null = null;
      if (dayRes.ok) {
        const dayPayload = await dayRes.json();
        dayId = dayPayload.data?.id ?? null;
      } else if (dayRes.status === 422) {
        const listRes = await apiFetch(`/days?status=published`);
        if (listRes.ok) {
          const listPayload = await listRes.json();
          const found = (listPayload.data ?? []).find(
            (d: { date?: string; id: number }) =>
              String(d.date).startsWith(values.date),
          );
          dayId = found?.id ?? null;
        }
      }

      if (dayId) {
        const endpoint =
          eventType === "enemy"
            ? `/days/${dayId}/enemy-actions`
            : `/days/${dayId}/government-actions`;
        const body =
          eventType === "enemy"
            ? {
                title: values.title.trim(),
                description: values.description || values.summary || null,
                severity: values.severity || "medium",
                source: values.source || null,
                location: values.location || null,
                occurred_at: `${values.date}T${values.time || "12:00"}:00`,
                status: "published",
                custom_fields: customFields,
              }
            : {
                title: values.title.trim(),
                description: values.description || values.summary || null,
                agency: agency?.shortName || null,
                completed_at: `${values.date}T${values.time || "12:00"}:00`,
                status: "published",
                custom_fields: customFields,
              };
        await apiFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
    } catch {
      // Fall back to local store below
    }

    upsertTimelineEvent(event);
    onCreated?.(event);
    onClose();
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
              فرم بر اساس تنظیمات ادمین ساخته می‌شود
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

        <div className="space-y-3 text-sm">
          <Select
            label="وزارتخانه / بخش دولت"
            value={values.agencyId || ""}
            onChange={(v) => setValue("agencyId", v)}
            options={agencyOptions.map((a) => ({
              value: a.id,
              label: a.shortName,
            }))}
          />

          {activeFields.length === 0 ? (
            <>
              <Select
                label="نوع رویداد"
                value={values.eventType || "enemy"}
                onChange={(v) => setValue("eventType", v)}
                options={[
                  { value: "enemy", label: "اقدام دشمن" },
                  { value: "government", label: "اقدام دولت" },
                ]}
              />
              <Field
                label="عنوان"
                value={values.title || ""}
                onChange={(v) => setValue("title", v)}
              />
              <div className="space-y-1.5">
                <span className="text-xs text-[var(--text-secondary)]">تاریخ</span>
                <PersianDatePicker
                  value={values.date || ""}
                  onChange={(date) => setValue("date", date)}
                  placeholder="انتخاب تاریخ شمسی"
                  ariaLabel="تاریخ رویداد"
                  allowClear={false}
                />
              </div>
              <Select
                label="شدت"
                value={values.severity || "medium"}
                onChange={(v) => setValue("severity", v)}
                options={[
                  { value: "low", label: "کم" },
                  { value: "medium", label: "متوسط" },
                  { value: "high", label: "شدید" },
                  { value: "critical", label: "بحرانی" },
                ]}
              />
            </>
          ) : (
            activeFields.map((field) => (
              <DynamicField
                key={field.key}
                field={field}
                value={values[field.key] ?? ""}
                onChange={(v) => setValue(field.key, v)}
              />
            ))
          )}

          <Field
            label="ساعت"
            type="time"
            value={values.time || "12:00"}
            onChange={(v) => setValue("time", v)}
          />

          {error ? (
            <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => void publish()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            انتشار / ثبت
          </button>
        </div>
      </div>
    </div>
  );
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "date" || field.key === "date") {
    return (
      <div className="space-y-1.5">
        <span className="text-xs text-[var(--text-secondary)]">
          {field.label}
          {field.required ? " *" : ""}
        </span>
        <PersianDatePicker
          value={value}
          onChange={onChange}
          placeholder="انتخاب تاریخ شمسی"
          ariaLabel={field.label}
          allowClear={!field.required}
        />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="block space-y-1.5">
        <span className="text-xs text-[var(--text-secondary)]">
          {field.label}
          {field.required ? " *" : ""}
        </span>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-3)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
    );
  }

  if (field.type === "select" || field.key === "eventType" || field.key === "severity") {
    const options =
      field.options ??
      (field.key === "eventType"
        ? [
            { value: "enemy", label: "اقدام دشمن" },
            { value: "government", label: "اقدام دولت" },
          ]
        : field.key === "severity"
          ? [
              { value: "low", label: "کم" },
              { value: "medium", label: "متوسط" },
              { value: "high", label: "شدید" },
              { value: "critical", label: "بحرانی" },
            ]
          : []);
    return (
      <Select
        label={`${field.label}${field.required ? " *" : ""}`}
        value={value}
        onChange={onChange}
        options={options}
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value === "1" || value === "true"}
          onChange={(e) => onChange(e.target.checked ? "1" : "0")}
        />
        {field.label}
      </label>
    );
  }

  return (
    <Field
      label={`${field.label}${field.required ? " *" : ""}`}
      type={field.type === "number" ? "number" : "text"}
      value={value}
      onChange={onChange}
    />
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
        {options.length === 0 ? <option value="">—</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
