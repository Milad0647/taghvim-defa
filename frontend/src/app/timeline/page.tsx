import { TimelinePage } from "@/components/timeline/TimelinePage";
import { Suspense } from "react";
import { TimelineSkeleton } from "@/components/timeline/TimelineSkeleton";

export default function TimelineRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] p-6">
          <TimelineSkeleton />
        </div>
      }
    >
      <TimelinePage />
    </Suspense>
  );
}
