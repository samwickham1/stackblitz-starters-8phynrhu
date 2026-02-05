"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type LiveScore = {
  name: string;
  baseScore: number;
  externalScore: number;
  totalScore: number;
  externalSignals: { type: string; impact: number; detail: string }[];
};

type Recommendation = {
  name: string;
  totalScore: number;
  evidence: string[];
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [liveScore, setLiveScore] = useState<LiveScore | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<Recommendation[]>([]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/recommendations");
        if (!response.ok) return;
        const data = await response.json();
        setSuggested((data.results ?? []).slice(0, 6));
      } catch {
        setSuggested([]);
      }
    };

    load();
  }, []);

  const fetchLiveScore = async () => {
    if (!query.trim()) return;
    try {
      setLiveLoading(true);
      setLiveError(null);
      const response = await fetch(
        `/api/company-score?name=${encodeURIComponent(query.trim())}`
      );
      if (!response.ok) {
        throw new Error("Live score request failed");
      }
      const data = await response.json();
      setLiveScore(data);
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : "Failed to load score");
      setLiveScore(null);
    } finally {
      setLiveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Search companies
        </div>
        <h1 className="mt-2 text-3xl font-semibold">
          Enter a company to get a live sponsorship score.
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Company name"
            className="min-w-[240px] flex-1 rounded-xl border border-black/10 bg-white/80 px-4 py-2 text-sm focus:outline-none"
          />
          <button
            onClick={fetchLiveScore}
            className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist"
          >
            {liveLoading ? "Scoring..." : "Get live score"}
          </button>
          {liveError && <span className="text-xs text-rose-600">{liveError}</span>}
        </div>

        {liveScore && (
          <div className="mt-4 card p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate">
              Live score for {liveScore.name}
            </div>
            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="text-xs text-slate">Base</div>
                <div className="text-2xl font-semibold">{liveScore.baseScore}</div>
              </div>
              <div>
                <div className="text-xs text-slate">API impact</div>
                <div className="text-2xl font-semibold">
                  +{liveScore.externalScore}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate">Total</div>
                <div className="text-2xl font-semibold">
                  {liveScore.totalScore}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate">
              {liveScore.externalSignals.map((signal) => (
                <div key={signal.type}>
                  • {signal.type}: {signal.detail} (+{signal.impact})
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="panel p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Discovered companies
        </div>
        <h2 className="mt-2 text-2xl font-semibold">
          Recent outreach candidates from live signals
        </h2>
        <div className="mt-4 space-y-3">
          {suggested.length === 0 && (
            <div className="card p-4 text-sm text-slate">
              No candidates loaded yet.
            </div>
          )}
          {suggested.map((company) => (
            <div key={company.name} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{company.name}</div>
                <div className="text-xl font-semibold">{company.totalScore}</div>
              </div>
              <div className="mt-2 text-sm text-slate">
                {company.evidence?.[0] ?? "No evidence captured yet."}
              </div>
              <div className="mt-3">
                <Link
                  href={`/search?q=${encodeURIComponent(company.name)}`}
                  className="text-xs uppercase tracking-[0.2em] text-ink underline"
                >
                  Score this company
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
