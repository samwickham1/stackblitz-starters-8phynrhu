import { Signal } from "@/lib/types";

export default function SignalBars({ signals }: { signals: Signal[] }) {
  const top = [...signals].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div className="space-y-2">
      {top.map((signal) => (
        <div key={signal.id} className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate">
            <span className="uppercase tracking-[0.2em]">{signal.type}</span>
            <span className="mono">{signal.score}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-black/5">
            <div
              className="h-2 rounded-full bg-ink"
              style={{ width: `${Math.min(100, signal.score * 5)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
