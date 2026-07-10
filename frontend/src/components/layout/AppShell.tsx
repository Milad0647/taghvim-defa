"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type AppShellProps = {
  sidebar: ReactNode;
  main: ReactNode;
  detail?: ReactNode;
  detailOpen?: boolean;
  mobileNav?: ReactNode;
};

/**
 * RTL layout (right → left):
 * Sidebar (right) | Main (center) | Detail Panel (left)
 */
export function AppShell({
  sidebar,
  main,
  detail,
  detailOpen = false,
  mobileNav,
}: AppShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <div
        className="mx-auto flex min-h-screen max-w-[1680px] gap-2 p-2 sm:gap-3 sm:p-3 lg:gap-4 lg:p-4"
        style={{ direction: "rtl" }}
      >
        {/* Right: sidebar */}
        <div className="hidden shrink-0 lg:block">{sidebar}</div>

        {/* Center: timeline content */}
        <div className="flex min-w-0 flex-1 flex-col">{main}</div>

        {/* Left: event details */}
        <aside
          className={clsx(
            "sticky top-3 hidden self-start transition-all duration-200 xl:block",
            detailOpen
              ? "h-[calc(100vh-1.5rem)] w-[400px] shrink-0"
              : "h-0 w-0 overflow-hidden",
          )}
        >
          {detailOpen ? (
            <div className="h-full min-h-0 w-full">{detail}</div>
          ) : null}
        </aside>
      </div>

      {mobileNav}
    </div>
  );
}
