"use client";

import { StatusBadge } from "@/components/shared/SeverityBadge";
import { RelatedResponseCard } from "@/components/timeline/RelatedResponseCard";
import { formatResponseTime, severityLabel } from "@/lib/timeline";
import type { TimelineEvent } from "@/types/timeline";
import { Bug, MessageCircle, Shield, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type EventDetailPanelProps = {
  event: TimelineEvent | null;
  relatedResponses: TimelineEvent[];
  open: boolean;
  onClose: () => void;
  onOpenRelated: (event: TimelineEvent) => void;
};

export function EventDetailPanel({
  event,
  relatedResponses,
  open,
  onClose,
  onOpenRelated,
}: EventDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightbox) setLightbox(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, lightbox]);

  if (!open) return null;

  if (!event) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-primary)] p-4 text-sm text-[var(--text-secondary)]"
      >
        رویدادی برای نمایش جزئیات انتخاب نشده است.
      </div>
    );
  }

  const isEnemy = event.eventType === "enemy";
  const media = [
    ...(event.imageUrl
      ? [{ id: "cover", url: event.imageUrl, type: "image" as const }]
      : []),
    ...(event.media ?? []),
  ];
  const impacts = (event.impact || "")
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="جزئیات رخداد"
        className="flex h-full flex-col overflow-hidden xl:rounded-[14px]"
        style={{
          background: isEnemy
            ? `radial-gradient(circle at 55% 10%, rgba(109, 30, 48, 0.22), transparent 38%),
               linear-gradient(180deg, #17101C 0%, #0E1322 70%, #0B1322 100%)`
            : `radial-gradient(circle at 55% 10%, rgba(30, 58, 138, 0.22), transparent 38%),
               linear-gradient(180deg, #0F172A 0%, #0B1322 100%)`,
          border: isEnemy
            ? "1px solid rgba(207, 48, 62, 0.62)"
            : "1px solid rgba(46, 116, 210, 0.55)",
          boxShadow: isEnemy
            ? "inset 0 0 40px rgba(174, 28, 49, 0.06)"
            : "inset 0 0 40px rgba(30, 64, 175, 0.06)",
        }}
      >
        <div
          className="flex items-start justify-between gap-3 p-4"
          style={{
            borderBottom: isEnemy
              ? "1px solid rgba(151, 56, 73, 0.25)"
              : "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {isEnemy ? (
                <Bug className="h-[19px] w-[19px]" style={{ color: "#E83442" }} />
              ) : (
                <Shield className="h-[19px] w-[19px]" style={{ color: "#3B82F6" }} />
              )}
              <span
                className="text-[14px] font-bold"
                style={{ color: isEnemy ? "#FF494F" : "#60A5FA" }}
              >
                {isEnemy ? "جزئیات اقدام دشمن" : "جزئیات اقدام دولت"}
              </span>
              {isEnemy ? (
                <span
                  className="rounded-lg px-[9px] py-1 text-[10px]"
                  style={{
                    background: "rgba(171, 27, 43, 0.35)",
                    color: "#FF555D",
                  }}
                >
                  {severityLabel(event.severity)}
                </span>
              ) : (
                <StatusBadge
                  status={event.actionStatus ?? event.verificationStatus}
                />
              )}
            </div>
            <h3
              className="text-[16px] font-bold leading-7"
              style={{ color: "#F7F3F5" }}
            >
              {event.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 hover:bg-white/5"
            style={{ color: "#F3F4F6" }}
            aria-label="بستن"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            style={{
              borderBottom: isEnemy
                ? "1px solid rgba(151, 56, 73, 0.18)"
                : "1px solid rgba(59, 130, 246, 0.15)",
              paddingBottom: 14,
            }}
          >
            <Meta label="تاریخ" value={event.date} />
            <Meta label="ساعت" value={event.time} />
            <Meta label="دسته‌بندی" value={event.category} />
            <Meta label="منبع" value={event.source || "—"} />
            <Meta
              label="مکان"
              value={
                [event.location?.city, event.location?.province]
                  .filter(Boolean)
                  .join("، ") || "—"
              }
            />
            <Meta label="نهاد" value={event.organization || "—"} />
          </div>

          <section>
            <h4
              className="mb-1.5 flex items-center gap-2 text-[13px] font-bold"
              style={{ color: "#ECE6E9" }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: isEnemy ? "#EE4C58" : "#3B82F6" }}
              />
              خلاصه رویداد
            </h4>
            <p className="text-[13px] leading-[1.85]" style={{ color: "#C6BEC4" }}>
              {event.description || event.summary}
            </p>
          </section>

          {media.length > 0 ? (
            <section>
              <h4
                className="mb-2 text-[13px] font-bold"
                style={{ color: "#EDE8EB" }}
              >
                تصاویر و مدارک
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {media.slice(0, 3).map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightbox(item.url)}
                    className="relative overflow-hidden rounded-lg"
                    style={{ border: "1px solid #25314A" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt=""
                      className="h-20 w-full object-cover"
                    />
                    {idx === 2 && media.length > 3 ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white">
                        +{(media.length - 3).toLocaleString("fa-IR")}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {impacts.length > 0 ? (
            <section>
              <h4
                className="mb-2 flex items-center gap-2 text-[13px] font-bold"
                style={{ color: "#ECE6E9" }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: isEnemy ? "#EE4C58" : "#3B82F6" }}
                />
                تأثیر و پیامد
              </h4>
              <ul className="space-y-1.5 text-[13px]" style={{ color: "#D0C8CE" }}>
                {impacts.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      className="mt-2 h-[5px] w-[5px] shrink-0 rounded-full"
                      style={{ background: isEnemy ? "#EE4C58" : "#3B82F6" }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {(event.tags ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {event.tags!.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-[15px] py-[5px] text-[11px]"
                  style={
                    isEnemy
                      ? {
                          background: "rgba(85, 19, 33, 0.28)",
                          border: "1px solid rgba(223, 54, 69, 0.58)",
                          color: "#FF555D",
                        }
                      : {
                          background: "rgba(30, 58, 138, 0.28)",
                          border: "1px solid rgba(59, 130, 246, 0.5)",
                          color: "#55A1FF",
                        }
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {isEnemy ? (
            <section className="space-y-2">
              <h4
                className="text-[13px] font-bold"
                style={{ color: "#ECE6E9" }}
              >
                پاسخ‌های مرتبط دولت
              </h4>
              {relatedResponses.length > 0 ? (
                relatedResponses.map((response) => (
                  <RelatedResponseCard
                    key={response.id}
                    response={response}
                    responseTimeMinutes={event.responseTimeMinutes}
                    onOpen={onOpenRelated}
                  />
                ))
              ) : (
                <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  برای این رخداد هنوز پاسخ مرتبطی ثبت نشده است.
                </p>
              )}
              {event.responseTimeMinutes != null ? (
                <p className="text-xs text-cyan-300">
                  زمان واکنش: {formatResponseTime(event.responseTimeMinutes)}
                </p>
              ) : null}
            </section>
          ) : null}
        </div>

        <div
          className="p-3"
          style={{
            borderTop: isEnemy
              ? "1px solid rgba(151, 56, 73, 0.25)"
              : "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <button
            type="button"
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg px-4 text-[11px]"
            style={{
              background: "linear-gradient(180deg, #171F35, #121A2E)",
              border: "1px solid #25304B",
              color: "#E5E7EC",
            }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            مشاهده نظرات ({(event.commentsCount ?? 0).toLocaleString("fa-IR")})
          </button>
        </div>
      </div>

      {lightbox ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="بستن تصویر"
            onClick={() => setLightbox(null)}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="relative z-[71] max-h-[85vh] max-w-[90vw] rounded-xl object-contain"
          />
        </div>
      ) : null}
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px]" style={{ color: "#8E8792" }}>
        {label}
      </p>
      <p className="mt-[5px] text-[11px]" style={{ color: "#E1DCE1" }}>
        {value}
      </p>
    </div>
  );
}
