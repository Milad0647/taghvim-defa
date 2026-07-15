"use client";

import { apiFetch, getCurrentUser, logoutRequest } from "@/lib/auth";
import {
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  ROLE_LABELS,
  userHasPermission,
  type AdminUser,
  type Permission,
  type UserRole,
} from "@/types/auth";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function MySubusersPage() {
  const router = useRouter();
  const [me, setMe] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>([]);

  const grantable = useMemo(() => {
    if (!me) return [] as Permission[];
    if (me.role === "super_admin") return ALL_PERMISSIONS;
    return me.permissions ?? [];
  }, [me]);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.replace("/login");
      return;
    }
    if (!userHasPermission(current, "manage_subusers")) {
      router.replace("/my-content");
      return;
    }
    setMe(current);
    setSelectedPerms(
      (current.permissions ?? []).filter((p) => p !== "manage_users"),
    );
    void loadUsers();
  }, [router]);

  async function loadUsers() {
    const res = await apiFetch("/users");
    if (!res.ok) {
      setError("بارگذاری کاربران ناموفق بود");
      return;
    }
    const payload = await res.json();
    const list = (payload.data ?? []).map((u: Record<string, unknown>) => ({
      id: String(u.id),
      name: String(u.name),
      email: String(u.email),
      role: (u.role as UserRole) ?? "editor",
      is_active: Boolean(u.is_active),
      created_at: String(u.created_at ?? ""),
      parent_id: u.parent_id as string | number | null,
      permissions: (u.permissions as Permission[]) ?? [],
      agencyIds: [],
    })) as AdminUser[];
    setUsers(list);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        role: "editor",
        permissions: selectedPerms.filter((p) => grantable.includes(p)),
      }),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.message ?? "ایجاد کاربر ناموفق بود");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    await loadUsers();
  }

  async function onDelete(id: string) {
    if (!confirm("حذف این زیردست؟")) return;
    const res = await apiFetch(`/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("حذف ناموفق بود");
      return;
    }
    await loadUsers();
  }

  if (!me) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 text-[var(--text-primary)]" style={{ direction: "rtl" }}>
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">زیردستان من</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              فقط مجوزهایی که خودتان دارید قابل تفویض است.
            </p>
          </div>
          <Link href="/my-content" className="text-sm text-[var(--primary)]">
            بازگشت
          </Link>
        </div>

        <form onSubmit={onCreate} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام"
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ایمیل"
              type="email"
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              type="password"
              required
              className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {grantable.map((perm) => (
              <label key={perm} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={selectedPerms.includes(perm)}
                  onChange={(e) => {
                    setSelectedPerms((prev) =>
                      e.target.checked
                        ? [...prev, perm]
                        : prev.filter((p) => p !== perm),
                    );
                  }}
                />
                {PERMISSION_LABELS[perm]}
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            ایجاد زیردست
          </button>
        </form>

        {error ? (
          <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-600">{error}</p>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-3 py-2 text-right">نام</th>
                <th className="px-3 py-2 text-right">ایمیل</th>
                <th className="px-3 py-2 text-right">نقش</th>
                <th className="px-3 py-2 text-right">مجوزها</th>
                <th className="px-3 py-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)]">
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="px-3 py-2">{ROLE_LABELS[u.role]}</td>
                  <td className="px-3 py-2 text-xs text-[var(--text-secondary)]">
                    {(u.permissions ?? []).map((p) => PERMISSION_LABELS[p]).join(" · ") || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => void onDelete(u.id)}
                      className="rounded-lg border border-red-500/30 p-1.5 text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={async () => {
            await logoutRequest();
            router.replace("/login");
          }}
          className="text-xs text-[var(--text-secondary)]"
        >
          خروج
        </button>
      </div>
    </div>
  );
}
