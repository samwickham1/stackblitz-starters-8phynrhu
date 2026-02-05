import { Company, ScoreTier, Signal } from "@/lib/types";

export function scoreTier(score: number): ScoreTier {
  if (score >= 75) return "High";
  if (score >= 55) return "Medium";
  return "Low";
}

export function topSignals(signals: Signal[], count = 3) {
  return [...signals].sort((a, b) => b.score - a.score).slice(0, count);
}

export function latestSignalDate(signals: Signal[]) {
  return [...signals]
    .map((s) => new Date(s.occurredAt).getTime())
    .sort((a, b) => b - a)[0];
}
