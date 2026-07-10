import { API_BASE } from "@/lib/api";
import {
  authenticateLocal,
  clearSession,
  getSession,
  setSession,
} from "@/lib/admin-store";
import type { AdminUser, AuthSession } from "@/types/auth";

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthSession> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const payload = await response.json();
      const rawUser = payload.user?.data ?? payload.user;
      const user: AdminUser = {
        id: String(rawUser.id),
        name: rawUser.name,
        email: rawUser.email,
        role: rawUser.role,
        is_active: rawUser.is_active ?? true,
        created_at: rawUser.created_at ?? new Date().toISOString(),
      };
      setSession(payload.token, user);
      return { token: payload.token, user };
    }

    if (response.status === 401 || response.status === 422) {
      throw new Error("ایمیل یا رمز عبور نادرست است.");
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("نادرست")) {
      throw err;
    }
    // Fall through to local auth when API is offline
  }

  const user = authenticateLocal(email, password);
  const token = `local-${user.id}-${Date.now()}`;
  setSession(token, user);
  return { token, user };
}

export async function logoutRequest() {
  const session = getSession();
  if (session?.token && !session.token.startsWith("local-")) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      });
    } catch {
      // ignore
    }
  }
  clearSession();
}

export function getCurrentUser(): AdminUser | null {
  return getSession()?.user ?? null;
}
