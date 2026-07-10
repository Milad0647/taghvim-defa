import type { AdminUser } from "@/types/auth";
import {
  defaultDashboardSettings,
  type DashboardSettings,
} from "@/types/settings";

const USERS_KEY = "taghvim_admin_users";
const SETTINGS_KEY = "taghvim_dashboard_settings";
const SESSION_KEY = "taghvim_auth_session";

const SEED_USERS: AdminUser[] = [
  {
    id: "u-admin",
    name: "مدیر سیستم",
    email: "admin@taghvim.local",
    role: "super_admin",
    is_active: true,
    created_at: new Date().toISOString(),
    password: "password",
  },
  {
    id: "u-editor",
    name: "کارشناس رصد",
    email: "editor@taghvim.local",
    role: "editor",
    is_active: true,
    created_at: new Date().toISOString(),
    password: "password",
  },
  {
    id: "u-viewer",
    name: "ناظر",
    email: "viewer@taghvim.local",
    role: "viewer",
    is_active: true,
    created_at: new Date().toISOString(),
    password: "password",
  },
];

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function ensureSeedUsers(): AdminUser[] {
  const existing = readJson<AdminUser[] | null>(USERS_KEY, null);
  if (existing && existing.length > 0) return existing;
  writeJson(USERS_KEY, SEED_USERS);
  return SEED_USERS;
}

export function listUsers(): AdminUser[] {
  return ensureSeedUsers().map(({ password: _p, ...user }) => user as AdminUser);
}

export function getUsersWithSecrets(): AdminUser[] {
  return ensureSeedUsers();
}

export function createUser(input: {
  name: string;
  email: string;
  role: AdminUser["role"];
  password: string;
  is_active?: boolean;
}): AdminUser {
  const users = ensureSeedUsers();
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("این ایمیل قبلاً ثبت شده است.");
  }

  const user: AdminUser = {
    id: `u-${Date.now()}`,
    name: input.name,
    email: input.email,
    role: input.role,
    is_active: input.is_active ?? true,
    created_at: new Date().toISOString(),
    password: input.password,
  };

  writeJson(USERS_KEY, [...users, user]);
  const { password: _p, ...safe } = user;
  return safe as AdminUser;
}

export function updateUser(
  id: string,
  patch: Partial<Pick<AdminUser, "name" | "email" | "role" | "is_active">> & {
    password?: string;
  },
): AdminUser {
  const users = ensureSeedUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) throw new Error("کاربر پیدا نشد.");

  if (
    patch.email &&
    users.some(
      (u) => u.id !== id && u.email.toLowerCase() === patch.email!.toLowerCase(),
    )
  ) {
    throw new Error("این ایمیل قبلاً ثبت شده است.");
  }

  const next = { ...users[index]!, ...patch };
  users[index] = next;
  writeJson(USERS_KEY, users);
  const { password: _p, ...safe } = next;
  return safe as AdminUser;
}

export function deleteUser(id: string) {
  const users = ensureSeedUsers().filter((u) => u.id !== id);
  writeJson(USERS_KEY, users);
}

export function authenticateLocal(
  email: string,
  password: string,
): AdminUser {
  const users = ensureSeedUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );

  if (!user || user.password !== password) {
    throw new Error("ایمیل یا رمز عبور نادرست است.");
  }
  if (!user.is_active) {
    throw new Error("این حساب غیرفعال است.");
  }

  const { password: _p, ...safe } = user;
  return safe as AdminUser;
}

export function getSession(): { token: string; user: AdminUser } | null {
  return readJson(SESSION_KEY, null);
}

export function setSession(token: string, user: AdminUser) {
  writeJson(SESSION_KEY, { token, user });
  if (canUseStorage()) {
    localStorage.setItem("taghvim_token", token);
  }
}

export function clearSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("taghvim_token");
}

export function getDashboardSettings(): DashboardSettings {
  const stored = readJson<Partial<DashboardSettings>>(
    SETTINGS_KEY,
    {},
  );
  return { ...defaultDashboardSettings, ...stored };
}

export function saveDashboardSettings(
  settings: DashboardSettings,
): DashboardSettings {
  writeJson(SETTINGS_KEY, settings);
  return settings;
}
