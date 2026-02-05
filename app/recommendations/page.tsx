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
  evidence: string[];
  entity?: {
    id: string;
    label: string;
    description?: string;
    url: string;
  } | null;
};

export default function RecommendationsPage() {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [query, setQuery] = useState<string | null>(null);
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
        setQuery(data.query ?? null);
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
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Recommendations
        </div>
        <h1 className="mt-2 text-3xl font-semibold">
          Real companies surfaced from live signals
        </h1>
        <p className="mt-2 text-sm text-slate">
          Ranked using GDELT news volume and Wikidata sponsorship links.
        </p>
        {query && (
          <div className="mt-2 text-xs text-slate">
            Query: {query}
          </div>
        )}
        {updatedAt && (
          <div className="mt-2 text-xs text-slate">
            Updated {new Date(updatedAt).toLocaleString()}
          </div>
        )}
        {error && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
      </section>

      <section className="space-y-4">
        {loading && (
          <div className="card p-4 text-sm text-slate">
            Loading live recommendations...
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
                {company.entity?.url && (
                  <a
                    href={company.entity.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Wikidata
                  </a>
                )}
              </div>

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
