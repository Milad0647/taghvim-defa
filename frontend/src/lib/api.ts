import type { TimelineResponse } from "@/types/calendar";

/**
 * Resolve API base at call-time so a production build accidentally
 * pointed at localhost still talks to a same-origin / configured API.
 */
export function getApiBase(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const pageIsLocal = host === "localhost" || host === "127.0.0.1";
    const envIsLocal =
      !fromEnv ||
      fromEnv.includes("localhost") ||
      fromEnv.includes("127.0.0.1");

    // Production site must never call the visitor's localhost
    if (!pageIsLocal && envIsLocal) {
      return `${window.location.origin}/api/v1`;
    }
  }

  return fromEnv || "http://localhost:8000/api/v1";
}

/** @deprecated Prefer getApiBase() — kept for older imports */
export const API_BASE = getApiBase();

function authHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("taghvim_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchTimeline(
  from?: string,
  to?: string,
): Promise<TimelineResponse> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const query = params.toString();
  const base = getApiBase();
  const url = `${base}/timeline${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load timeline (${response.status})`);
  }

  return response.json();
}

export async function fetchDay(date: string) {
  const response = await fetch(`${getApiBase()}/timeline/${date}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load day (${response.status})`);
  }

  return response.json();
}
