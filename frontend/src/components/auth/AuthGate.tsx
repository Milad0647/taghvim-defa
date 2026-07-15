"use client";

import { canViewAdminViews, getCurrentUser } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const PUBLIC_PATHS = ["/login", "/admin/login"];

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    const user = getCurrentUser();

    if (!user && !isPublic) {
      router.replace("/login");
      return;
    }

    if (user && isPublic) {
      router.replace(canViewAdminViews(user) ? "/timeline" : "/my-content");
      return;
    }

    if (
      user &&
      !canViewAdminViews(user) &&
      (pathname.startsWith("/timeline") ||
        pathname.startsWith("/overview") ||
        pathname === "/")
    ) {
      router.replace("/my-content");
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready && !PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--text-secondary)]">
        در حال بررسی دسترسی...
      </div>
    );
  }

  return <>{children}</>;
}
