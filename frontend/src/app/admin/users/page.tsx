"use client";

import { RequireAuth } from "@/components/admin/RequireAuth";
import { apiFetch, getCurrentUser } from "@/lib/auth";
import {
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  ROLE_LABELS,
  type AdminUser,
  type Permission,
  type UserRole,
} from "@/types/auth";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ROLES: UserRole[] = ["super_admin", "editor", "reviewer", "viewer"];

export default function AdminUsersPage() {
  return (
    <RequireAuth requireManageUsers>
      <UsersManager />
    </RequireAuth>
  );
}

function UsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [me, setMe] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);

  const grantable = useMemo(() => {
    if (!me) return [] as Permission[];
    if (me.role === "super_admin") return ALL_PERMISSIONS;
    return me.permissions ?? [];
  }, [me]);

  async function refresh() {
    const res = await apiFetch("/users");
    if (!res.ok) {
      setError("بارگذاری کاربران ناموفق بود");
      return;
    }
    const payload = await res.json();
    const rows = (payload.data ?? []).map((u: Record<string, unknown>) => ({
      id: String(u.id),
      name: String(u.name ?? ""),
      email: String(u.email ?? ""),
      role: (u.role as UserRole) ?? "viewer",
      is_active: Boolean(u.is_active),
      created_at: String(u.created_at ?? ""),
      parent_id: u.parent_id ?? null,
      permissions: Array.isArray(u.permissions) ? u.permissions : [],
      agencyIds: [],
    })) as AdminUser[];
    setUsers(rows);
  }

  useEffect(() => {
    setMe(getCurrentUser());
    void refresh();
  }, []);

  const tree = useMemo(() => buildTree(users), [users]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            کاربران و دسترسی‌ها
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            سلسله‌مراتب کاربران و تفویض مجوزها.
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

      <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        {tree.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">کاربری نیست</p>
        ) : (
          tree.map((node) => (
            <UserTreeNode
              key={node.user.id}
              node={node}
              depth={0}
              onEdit={(u) => {
                setEditing(u);
                setCreating(false);
              }}
              onDelete={async (u) => {
                if (!confirm("حذف این کاربر؟")) return;
                const res = await apiFetch(`/users/${u.id}`, { method: "DELETE" });
                if (!res.ok) {
                  setError("حذف ناموفق بود");
                  return;
                }
                await refresh();
              }}
            />
          ))
        )}
      </div>

      {error ? (
        <p className="rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {(creating || editing) && me ? (
        <UserForm
          grantable={grantable}
          users={users}
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setCreating(false);
            setEditing(null);
            await refresh();
          }}
          onError={setError}
        />
      ) : null}
    </div>
  );
}

type TreeNode = { user: AdminUser; children: TreeNode[] };

function buildTree(users: AdminUser[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  users.forEach((u) => map.set(u.id, { user: u, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    const parentId = node.user.parent_id != null ? String(node.user.parent_id) : null;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function UserTreeNode({
  node,
  depth,
  onEdit,
  onDelete,
}: {
  node: TreeNode;
  depth: number;
  onEdit: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
}) {
  return (
    <div>
      <div
        className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2"
        style={{ marginRight: depth * 16 }}
      >
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{node.user.name}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {node.user.email} · {ROLE_LABELS[node.user.role]} ·{" "}
            {(node.user.permissions ?? []).length} مجوز
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(node.user)}
            className="rounded-lg border border-[var(--border)] p-2"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(node.user)}
            className="rounded-lg border border-red-500/30 p-2 text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {node.children.map((child) => (
        <UserTreeNode
          key={child.user.id}
          node={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function UserForm({
  grantable,
  users,
  initial,
  onClose,
  onSaved,
  onError,
}: {
  grantable: Permission[];
  users: AdminUser[];
  initial: AdminUser | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(initial?.role ?? "editor");
  const [parentId, setParentId] = useState(
    initial?.parent_id != null ? String(initial.parent_id) : "",
  );
  const [perms, setPerms] = useState<Permission[]>(initial?.permissions ?? []);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body: Record<string, unknown> = {
      name,
      email,
      role,
      is_active: isActive,
      permissions: perms,
      parent_id: parentId ? Number(parentId) : null,
    };
    if (password) body.password = password;
    if (!initial && !password) {
      onError("رمز عبور الزامی است");
      return;
    }

    const res = await apiFetch(initial ? `/users/${initial.id}` : "/users", {
      method: initial ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      onError(payload.message ?? "ذخیره ناموفق بود");
      return;
    }
    await onSaved();
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4"
    >
      <h3 className="font-semibold text-[var(--text-primary)]">
        {initial ? "ویرایش کاربر" : "کاربر جدید"}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm"
          placeholder="نام"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm"
          placeholder="ایمیل"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm"
          placeholder={initial ? "رمز جدید (اختیاری)" : "رمز عبور"}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2 text-sm"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="">بدون والد (ریشه)</option>
          {users
            .filter((u) => u.id !== initial?.id)
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          فعال
        </label>
      </div>

      <div>
        <p className="mb-2 text-xs text-[var(--text-secondary)]">مجوزها (فقط آنچه خودتان دارید)</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {grantable.map((p) => (
            <label key={p} className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={perms.includes(p)}
                onChange={(e) => {
                  setPerms((prev) =>
                    e.target.checked ? [...prev, p] : prev.filter((x) => x !== p),
                  );
                }}
              />
              {PERMISSION_LABELS[p]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          ذخیره
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
