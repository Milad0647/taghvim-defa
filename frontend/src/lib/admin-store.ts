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
    agencyIds: [],
    password: "password",
  },
  {
    id: "u-editor",
    name: "کارشناس رصد",
    email: "editor@taghvim.local",
    role: "editor",
    is_active: true,
    created_at: new Date().toISOString(),
    agencyIds: ["agency-defense", "agency-mfa"],
    password: "password",
  },
  {
    id: "u-health",
    name: "کارشناس بهداشت",
    email: "health@taghvim.local",
    role: "editor",
    is_active: true,
    created_at: new Date().toISOString(),
    agencyIds: ["agency-health"],
    password: "password",
  },
  {
    id: "u-viewer",
    name: "ناظر",
    email: "viewer@taghvim.local",
    role: "viewer",
    is_active: true,
    created_at: new Date().toISOString(),
    agencyIds: [],
    password: "password",
  },
];

const USERS_VERSION_KEY = "taghvim_admin_users_version";
const USERS_SEED_VERSION = "users-agencies-v1";

function normalizeUser(user: AdminUser): AdminUser {
  return {
    ...user,
    agencyIds: Array.isArray(user.agencyIds) ? user.agencyIds : [],
  };
}

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
  if (!canUseStorage()) return SEED_USERS.map(normalizeUser);

  const version = localStorage.getItem(USERS_VERSION_KEY);
  const existing = readJson<AdminUser[] | null>(USERS_KEY, null);

  if (version !== USERS_SEED_VERSION || !existing?.length) {
    writeJson(USERS_KEY, SEED_USERS);
    localStorage.setItem(USERS_VERSION_KEY, USERS_SEED_VERSION);
    return SEED_USERS.map(normalizeUser);
  }

  const normalized = existing.map(normalizeUser);
  writeJson(USERS_KEY, normalized);
  return normalized;
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
  agencyIds?: string[];
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
    agencyIds: input.agencyIds ?? [],
    password: input.password,
  };

  writeJson(USERS_KEY, [...users, user]);
  const { password: _p, ...safe } = user;
  return safe as AdminUser;
}

export function updateUser(
  id: string,
  patch: Partial<
    Pick<AdminUser, "name" | "email" | "role" | "is_active" | "agencyIds">
  > & {
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

  const next = normalizeUser({ ...users[index]!, ...patch });
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
