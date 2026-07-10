import { HomeClient } from "@/components/HomeClient";
import { fetchTimeline } from "@/lib/api";
import { Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let usingFallback = false;
  let days = undefined;
  let maxScore = undefined;
  let stats = undefined;

  try {
    const timeline = await fetchTimeline();
    days = timeline.data;
    maxScore = timeline.meta.max_activity_score;
    stats = timeline.meta.stats;
  } catch {
    usingFallback = true;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <header className="mb-10 space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          گزارش زنده دفاعی
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            تقویم{" "}
            <span className="bg-gradient-to-l from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              دفاعی
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            هر روز، اقدامات دشمن و پاسخ دولت را در یک نگاه ببینید. شدت فعالیت با
            رنگ مشخص می‌شود — هرچه قرمزتر، روز پرتنش‌تر.
          </p>
        </div>
      </header>

      <HomeClient
        days={days}
        maxScore={maxScore}
        stats={stats}
        usingFallback={usingFallback}
      />
    </main>
  );
}
