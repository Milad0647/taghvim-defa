"use client";

import { RequireAuth } from "@/components/admin/RequireAuth";
import { apiFetch } from "@/lib/auth";
import { FALLBACK_FORM_SCHEMA } from "@/lib/form-schema";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type FormField = {
  id?: number;
  key: string;
  label: string;
  type: string;
  options: Array<{ value: string; label: string }> | null;
  required: boolean;
  sort_order: number;
  section: string;
  is_system: boolean;
  is_active: boolean;
};

type FormSchema = {
  key: string;
  name: string;
  fields: FormField[];
};

const FIELD_TYPES = ["text", "textarea", "select", "date", "number", "boolean", "file"] as const;

export default function FormBuilderPage() {
  return (
    <RequireAuth requirePermission="manage_form_schema">
      <FormBuilder />
    </RequireAuth>
  );
}

function FormBuilder() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function load() {
    setError(null);
    try {
      const res = await apiFetch("/form-schema");
      if (!res.ok) {
        setSchema(FALLBACK_FORM_SCHEMA as unknown as FormSchema);
        setError("API در دسترس نبود؛ فرم پیش‌فرض نمایش داده شد. برای ذخیره، سرور را روشن کنید.");
        return;
      }
      const payload = await res.json();
      setSchema(payload.data ?? (FALLBACK_FORM_SCHEMA as unknown as FormSchema));
    } catch (err) {
      setSchema(FALLBACK_FORM_SCHEMA as unknown as FormSchema);
      setError(
        err instanceof Error
          ? err.message
          : "API در دسترس نبود؛ فرم پیش‌فرض نمایش داده شد.",
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function updateField(index: number, patch: Partial<FormField>) {
    if (!schema) return;
    const fields = schema.fields.map((f, i) => (i === index ? { ...f, ...patch } : f));
    setSchema({ ...schema, fields });
    setSaved(false);
  }

  function addField() {
    if (!schema) return;
    const key = `custom_${Date.now()}`;
    setSchema({
      ...schema,
      fields: [
        ...schema.fields,
        {
          key,
          label: "فیلد جدید",
          type: "text",
          options: null,
          required: false,
          sort_order: schema.fields.length,
          section: "custom",
          is_system: false,
          is_active: true,
        },
      ],
    });
    setSaved(false);
  }

  function removeField(index: number) {
    if (!schema) return;
    const field = schema.fields[index];
    if (field?.is_system) {
      setError("فیلدهای ثابت سیستم قابل حذف نیستند");
      return;
    }
    setSchema({
      ...schema,
      fields: schema.fields.filter((_, i) => i !== index),
    });
    setSaved(false);
  }

  async function save() {
    if (!schema) return;
    setError(null);
    setSaved(false);
    try {
      const res = await apiFetch("/form-schema", {
        method: "PUT",
        body: JSON.stringify({
          name: schema.name,
          fields: schema.fields.map((f, i) => ({ ...f, sort_order: i })),
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.message ?? "ذخیره ناموفق بود");
        return;
      }
      const payload = await res.json();
      setSchema(payload.data);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره ناموفق بود");
    }
  }

  if (!schema) {
    return <p className="text-sm text-[var(--text-secondary)]">در حال بارگذاری...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">فرم‌ساز رویداد</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            فیلدهای ثابت قفل هستند؛ می‌توانید فیلد سفارشی اضافه یا غیرفعال کنید.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addField}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--hover)]"
          >
            <Plus className="h-4 w-4" />
            فیلد جدید
          </button>
          <button
            type="button"
            onClick={() => void save()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Save className="h-4 w-4" />
            ذخیره
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}
      {saved ? (
        <p className="rounded-xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-600">ذخیره شد</p>
      ) : null}

      <div className="space-y-3">
        {schema.fields.map((field, index) => (
          <div
            key={field.key}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {field.label}
                {field.is_system ? (
                  <span className="mr-2 text-[10px] text-[var(--primary)]">(ثابت)</span>
                ) : null}
              </p>
              {!field.is_system ? (
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="rounded-lg border border-red-500/30 p-2 text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-1 text-xs">
                <span className="text-[var(--text-secondary)]">کلید</span>
                <input
                  value={field.key}
                  disabled={field.is_system}
                  onChange={(e) => updateField(index, { key: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 disabled:opacity-60"
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-[var(--text-secondary)]">برچسب</span>
                <input
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-[var(--text-secondary)]">نوع</span>
                <select
                  value={field.type}
                  disabled={field.is_system}
                  onChange={(e) => updateField(index, { type: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 disabled:opacity-60"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs">
                <span className="text-[var(--text-secondary)]">بخش</span>
                <input
                  value={field.section}
                  onChange={(e) => updateField(index, { section: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                />
                الزامی
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.is_active}
                  onChange={(e) => updateField(index, { is_active: e.target.checked })}
                />
                فعال
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
