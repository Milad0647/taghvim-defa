import type { TimelineResponse } from "@/types/calendar";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api/v1";

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
  const url = `${API_BASE}/timeline${query ? `?${query}` : ""}`;

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
  const response = await fetch(`${API_BASE}/timeline/${date}`, {
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

export { API_BASE };
