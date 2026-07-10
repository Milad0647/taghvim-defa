"use client";

type TimelineNodeProps = {
  tone: "enemy" | "government";
  size?: "sm" | "md" | "lg";
  active?: boolean;
};

/** Shared rail offset from the content box right edge (px). */
export const TIMELINE_RAIL_RIGHT = 14;

export function TimelineNode({
  tone,
  size = "md",
  active = false,
}: TimelineNodeProps) {
  const isEnemy = tone === "enemy";
  const dim = size === "sm" ? 13 : size === "lg" || active ? 17 : 15;

  return (
    <span
      className="pointer-events-none absolute top-1/2 z-10 rounded-full"
      style={{
        right: TIMELINE_RAIL_RIGHT,
        width: dim,
        height: dim,
        transform: "translate(50%, -50%)",
        background: isEnemy ? "#F04E58" : "#3B8AF2",
        border: isEnemy ? "3px solid #6E2031" : "3px solid #174D98",
        boxShadow: active
          ? isEnemy
            ? "0 0 0 2px #151E31, 0 0 16px rgba(239, 68, 68, 0.75)"
            : "0 0 0 2px #151E31, 0 0 16px rgba(59, 130, 246, 0.75)"
          : isEnemy
            ? "0 0 0 2px #151E31, 0 0 12px rgba(239, 68, 68, 0.6)"
            : "0 0 0 2px #151E31, 0 0 12px rgba(59, 130, 246, 0.6)",
      }}
      aria-hidden
    />
  );
}
