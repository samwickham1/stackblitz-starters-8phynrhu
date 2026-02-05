import { Signal } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function SignalTimeline({ signals }: { signals: Signal[] }) {
  const ordered = [...signals].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return (
    <div className="space-y-4">
      {ordered.map((signal) => (
        <div key={signal.id} className="card p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate">
            <span>{signal.type}</span>
            <span className="mono">{formatDate(signal.occurredAt)}</span>
          </div>
          <div className="mt-2 text-sm">{signal.evidence}</div>
          <div className="mt-3 text-xs text-slate">
            Signal score: <span className="mono">{signal.score}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
