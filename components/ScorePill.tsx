import { scoreTier } from "@/lib/score";

export default function ScorePill({ score }: { score: number }) {
  const tier = scoreTier(score);
  const tone =
    tier === "High"
      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
      : tier === "Medium"
      ? "border-amber-300 bg-amber-50 text-amber-700"
      : "border-rose-300 bg-rose-50 text-rose-700";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${tone}`}
    >
      {tier} • {score}
    </div>
  );
}
