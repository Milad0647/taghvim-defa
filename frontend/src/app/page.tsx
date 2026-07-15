"use client";

import { canViewAdminViews, getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(canViewAdminViews(user) ? "/timeline" : "/my-content");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-[var(--text-secondary)]">
      در حال هدایت...
    </div>
  );
}
