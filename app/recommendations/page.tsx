"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { companies } from "@/lib/data";

type Recommendation = {
  id: string;
  name: string;
  industry: string;
  region: string;
  baseScore: number;
  externalScore: number;
  totalScore: number;
  rightsFit: string[];
};

export default function RecommendationsPage() {
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

  const fallback = [...companies]
    .sort((a, b) => b.score - a.score)
    .map((company) => ({
      id: company.id,
      name: company.name,
      industry: company.industry,
      region: company.region,
      baseScore: company.score,
      externalScore: 0,
      totalScore: company.score,
      rightsFit: company.rightsFit
    }));

  const list = items.length > 0 ? items : fallback;

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate">
          Recommendations
        </div>
        <h1 className="mt-2 text-3xl font-semibold">
          Best companies to contact this week.
        </h1>
        <p className="mt-2 text-sm text-slate">
          Ranked using live API signals (GDELT + Wikidata).
        </p>
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
        {!loading &&
          list.map((company) => (
            <div key={company.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{company.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate">
                    {company.industry} • {company.region}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate">
                    Base: <span className="font-semibold">{company.baseScore}</span>
                  </div>
                  <div className="text-sm text-slate">
                    API: <span className="font-semibold">+{company.externalScore}</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {company.totalScore}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {company.rightsFit.map((right) => (
                  <span
                    key={right}
                    className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink"
                  >
                    {right}
                  </span>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href={`/company/${company.id}`}
                  className="text-xs uppercase tracking-[0.2em] text-ink underline"
                >
                  View company
                </Link>
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
