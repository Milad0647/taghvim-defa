"use client";

import { RequireAuth } from "@/components/admin/RequireAuth";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from "@/lib/admin-store";
import {
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  type AdminUser,
  type UserRole,
} from "@/types/auth";
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

const ROLES: UserRole[] = ["super_admin", "editor", "reviewer", "viewer"];

export default function AdminUsersPage() {
  return (
    <RequireAuth requireManageUsers>
      <UsersManager />
    </RequireAuth>
  );
}

function UsersManager() {
  const [users, setUsers] = useState<AdminUser[]>(() => listUsers());
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = () => setUsers(listUsers());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">کاربران و دسترسی‌ها</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            نقش هر کاربر سطح دسترسی او را مشخص می‌کند.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <UserPlus className="h-4 w-4" />
          کاربر جدید
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
        <table className="min-w-full text-sm">
          <thead className="border-b border-[var(--border)] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3 text-right font-medium">نام</th>
              <th className="px-4 py-3 text-right font-medium">ایمیل</th>
              <th className="px-4 py-3 text-right font-medium">نقش</th>
              <th className="px-4 py-3 text-right font-medium">وضعیت</th>
              <th className="px-4 py-3 text-right font-medium">دسترسی‌ها</th>
              <th className="px-4 py-3 text-right font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const perms = ROLE_PERMISSIONS[user.role];
              return (
                <tr key={user.id} className="border-b border-[var(--border)]">
                  <td className="px-4 py-3 text-[var(--text-primary)]">{user.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="px-4 py-3 text-blue-300">
                    {ROLE_LABELS[user.role]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.is_active
                          ? "rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300"
                          : "rounded-md bg-slate-500/20 px-2 py-0.5 text-xs text-[var(--text-secondary)]"
                      }
                    >
                      {user.is_active ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">
                    {[
                      perms.manageUsers ? "کاربران" : null,
                      perms.manageSettings ? "تنظیمات" : null,
                      perms.manageContent ? "محتوا" : null,
                      perms.publish ? "انتشار" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "فقط مشاهده"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(user);
                          setCreating(false);
                        }}
                        className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-secondary)] hover:bg-[var(--hover)]"
                        aria-label="ویرایش"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm("حذف این کاربر؟")) return;
                          try {
                            deleteUser(user.id);
                            refresh();
                          } catch (err) {
                            setError(
                              err instanceof Error ? err.message : "خطا",
                            );
                          }
                        }}
                        className="rounded-lg border border-red-500/30 p-2 text-red-300 hover:bg-red-500/10"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {(creating || editing) && (
        <UserFormModal
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
            setError(null);
          }}
          onSaved={() => {
            refresh();
            setCreating(false);
            setEditing(null);
          }}
          onError={setError}
        />
      )}

      <PermissionsGuide />
    </div>
  );
}

function UserFormModal({
  initial,
  onClose,
  onSaved,
  onError,
}: {
  initial: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<UserRole>(initial?.role ?? "editor");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const title = initial ? "ویرایش کاربر" : "ساخت کاربر جدید";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (initial) {
        updateUser(initial.id, {
          name,
          email,
          role,
          is_active: isActive,
          ...(password ? { password } : {}),
        });
      } else {
        if (!password) throw new Error("رمز عبور الزامی است.");
        createUser({ name, email, role, password, is_active: isActive });
      }
      onSaved();
    } catch (err) {
      onError(err instanceof Error ? err.message : "خطا در ذخیره");
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="بستن"
        onClick={onClose}
      />
      <div className="absolute inset-x-4 top-1/2 mx-auto max-w-lg -translate-y-1/2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <h3 className="mb-4 text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        <form onSubmit={onSubmit} className="space-y-3 text-sm">
          <Field label="نام" value={name} onChange={setName} required />
          <Field
            label="ایمیل"
            value={email}
            onChange={setEmail}
            type="email"
            required
          />
          <label className="block space-y-1.5">
            <span className="text-[var(--text-secondary)]">نقش / دسترسی</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <Field
            label={initial ? "رمز جدید (اختیاری)" : "رمز عبور"}
            value={password}
            onChange={setPassword}
            type="password"
            required={!initial}
          />
          <label className="flex items-center gap-2 text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            حساب فعال باشد
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              ذخیره
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-4 py-2"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function PermissionsGuide() {
  const rows = useMemo(
    () =>
      (Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({
        role,
        label: ROLE_LABELS[role],
        ...ROLE_PERMISSIONS[role],
      })),
    [],
  );

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">راهنمای نقش‌ها</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-[var(--text-secondary)]">
          <thead className="text-[var(--text-muted)]">
            <tr>
              <th className="px-2 py-2 text-right">نقش</th>
              <th className="px-2 py-2 text-right">کاربران</th>
              <th className="px-2 py-2 text-right">تنظیمات</th>
              <th className="px-2 py-2 text-right">محتوا</th>
              <th className="px-2 py-2 text-right">انتشار</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.role} className="border-t border-[var(--border)]">
                <td className="px-2 py-2">{row.label}</td>
                <td className="px-2 py-2">{row.manageUsers ? "✓" : "—"}</td>
                <td className="px-2 py-2">{row.manageSettings ? "✓" : "—"}</td>
                <td className="px-2 py-2">{row.manageContent ? "✓" : "—"}</td>
                <td className="px-2 py-2">{row.publish ? "✓" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
