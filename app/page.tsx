"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Recommendation = {
  name: string;
  totalScore: number;
  mediaMentions: number;
  gdeltMentions?: number;
  newsdataMentions?: number;
  sponsorLinks: number;
  signals?: { type: string; weight: number }[];
  evidence: string[];
  entity?: {
    id: string;
    label: string;
    description?: string;
    url: string;
  } | null;
};

export default function HomePage() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/recommendations");
        if (!response.ok) {
          throw new Error("Failed to load recommendations");
        }
        const data = await response.json();
        setItems(data.results ?? []);
        setUpdatedAt(data.updatedAt ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-8">
      <section className="panel p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Sponsorship Signals
        </div>
        <h1 className="mt-2 text-4xl font-semibold">
          Live discovery of sponsorship-ready companies.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate">
          Filtered for funding, geo expansion, or CMO hiring signals. Teams,
          leagues, and healthcare brands are excluded.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/search"
            className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist"
          >
            Search a company
          </Link>
          {updatedAt && (
            <span className="text-xs text-slate">
              Updated {new Date(updatedAt).toLocaleString()}
            </span>
          )}
        </div>
        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </section>

      <section className="space-y-4">
        {loading && (
          <div className="card p-4 text-sm text-slate">
            Loading live discovery list...
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="card p-4 text-sm text-slate">
            No companies discovered yet. Try again later.
          </div>
        )}
        {!loading &&
          items.map((company) => (
            <div key={company.name} className="card p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{company.name}</div>
                  {company.entity?.description && (
                    <div className="mt-1 text-xs text-slate">
                      {company.entity.description}
                    </div>
                  )}
                </div>
                <div className="text-2xl font-semibold">
                  {company.totalScore}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate">
                <div>Media mentions: {company.mediaMentions}</div>
                <div>GDELT: {company.gdeltMentions ?? 0}</div>
                <div>Newsdata: {company.newsdataMentions ?? 0}</div>
                <div>Wikidata sponsorships: {company.sponsorLinks}</div>
              </div>

              {company.signals && company.signals.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs text-slate">
                  <span>Signals:</span>
                  {company.signals.map((signal) => (
                    <span
                      key={signal.type}
                      className="rounded-full bg-ink/5 px-2 py-1 text-xs font-semibold text-ink"
                    >
                      {signal.type.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                {company.evidence.map((title, index) => (
                  <div key={`${company.name}-evidence-${index}`} className="text-sm">
                    • {title}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href={`/search?q=${encodeURIComponent(company.name)}`}
                  className="text-xs uppercase tracking-[0.2em] text-ink underline"
                >
                  Score this company
                </Link>
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
