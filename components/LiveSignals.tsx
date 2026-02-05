"use client";

import { useState } from "react";

type GdeltArticle = {
  title: string;
  url: string;
  seenDate?: string;
  sourceCountry?: string;
  domain?: string;
};

type WikidataSponsorship = {
  id: string;
  label: string;
  url: string;
  instance?: string;
};

type WikidataResponse = {
  entity?: {
    id: string;
    label: string;
    description?: string;
    url: string;
  };
  sponsorOf: WikidataSponsorship[];
};

export default function LiveSignals({ companyName }: { companyName: string }) {
  const [loading, setLoading] = useState(false);
  const [gdelt, setGdelt] = useState<GdeltArticle[]>([]);
  const [wikidata, setWikidata] = useState<WikidataResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = async () => {
    setLoading(true);
    setError(null);

    try {
      const [gdeltRes, wikiRes] = await Promise.all([
        fetch(`/api/gdelt?query=${encodeURIComponent(companyName)}`),
        fetch(`/api/wikidata?query=${encodeURIComponent(companyName)}`)
      ]);

      if (!gdeltRes.ok) {
        throw new Error("GDELT request failed");
      }
      if (!wikiRes.ok) {
        throw new Error("Wikidata request failed");
      }

      const gdeltData = (await gdeltRes.json()) as { articles: GdeltArticle[] };
      const wikiData = (await wikiRes.json()) as WikidataResponse;

      setGdelt(gdeltData.articles ?? []);
      setWikidata(wikiData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch signals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate">
            Live signals (beta)
          </div>
          <h3 className="mt-2 text-lg font-semibold">
            External signals from Wikidata and GDELT
          </h3>
          <p className="mt-1 text-sm text-slate">
            Pulls recent news and known sponsorship links to validate scoring.
          </p>
        </div>
        <button
          onClick={fetchSignals}
          className="rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist"
        >
          {loading ? "Fetching..." : "Fetch live signals"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate">
            GDELT news
          </div>
          <div className="space-y-3">
            {gdelt.length === 0 && (
              <div className="card p-4 text-sm text-slate">
                No articles loaded yet.
              </div>
            )}
            {gdelt.map((article, index) => (
              <div key={`${article.url}-${index}`} className="card p-4">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold underline"
                >
                  {article.title || "Untitled article"}
                </a>
                <div className="mt-2 text-xs text-slate">
                  {article.seenDate ?? "Unknown date"}
                  {article.domain ? ` • ${article.domain}` : ""}
                  {article.sourceCountry ? ` • ${article.sourceCountry}` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate">
            Wikidata sponsorships
          </div>
          <div className="space-y-3">
            {!wikidata && (
              <div className="card p-4 text-sm text-slate">
                No data loaded yet.
              </div>
            )}
            {wikidata?.entity && (
              <div className="card p-4">
                <div className="font-semibold">{wikidata.entity.label}</div>
                <div className="mt-1 text-sm text-slate">
                  {wikidata.entity.description ?? "No description"}
                </div>
                <a
                  href={wikidata.entity.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs uppercase tracking-[0.2em] text-ink underline"
                >
                  View entity
                </a>
              </div>
            )}
            {(wikidata?.sponsorOf ?? []).length === 0 && wikidata?.entity && (
              <div className="card p-4 text-sm text-slate">
                No sponsorship links found in Wikidata.
              </div>
            )}
            {(wikidata?.sponsorOf ?? []).map((item) => (
              <div key={item.id} className="card p-4">
                <div className="font-semibold">{item.label}</div>
                {item.instance && (
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate">
                    {item.instance}
                  </div>
                )}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs uppercase tracking-[0.2em] text-ink underline"
                >
                  Wikidata link
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
