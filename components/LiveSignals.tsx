"use client";

import { useEffect, useState } from "react";

type GdeltArticle = {
  title: string;
  url: string;
  seenDate?: string;
  sourceCountry?: string;
  domain?: string;
};

type NewsdataArticle = {
  title: string;
  url: string;
  pubDate?: string;
  sourceId?: string;
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

type CompanyScoreResponse = {
  name: string;
  baseScore: number;
  externalScore: number;
  totalScore: number;
  externalSignals: { type: string; impact: number; detail: string }[];
  gdelt: GdeltArticle[];
  newsdata: NewsdataArticle[];
  wikidata: WikidataResponse;
};

export default function LiveSignals({ companyName }: { companyName: string }) {
  const [loading, setLoading] = useState(false);
  const [gdelt, setGdelt] = useState<GdeltArticle[]>([]);
  const [newsdata, setNewsdata] = useState<NewsdataArticle[]>([]);
  const [wikidata, setWikidata] = useState<WikidataResponse | null>(null);
  const [score, setScore] = useState<CompanyScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchSignals = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/company-score?name=${encodeURIComponent(companyName)}`
      );

      if (!response.ok) {
        throw new Error("Score request failed");
      }

      const data = (await response.json()) as CompanyScoreResponse;
      setScore(data);
      setGdelt(data.gdelt ?? []);
      setNewsdata(data.newsdata ?? []);
      setWikidata(data.wikidata ?? null);
      setLastFetched(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch signals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyName) return;
    fetchSignals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName]);

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
          {lastFetched && (
            <div className="mt-2 text-xs text-slate">
              Last fetched: {new Date(lastFetched).toLocaleString()}
            </div>
          )}
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

      {score && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate">
              Base score
            </div>
            <div className="mt-2 text-2xl font-semibold">{score.baseScore}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate">
              API impact
            </div>
            <div className="mt-2 text-2xl font-semibold">
              +{score.externalScore}
            </div>
          </div>
          <div className="card p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate">
              Live score
            </div>
            <div className="mt-2 text-2xl font-semibold">{score.totalScore}</div>
          </div>
        </div>
      )}

      {score && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {score.externalSignals.map((signal) => (
            <div key={signal.type} className="card p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate">
                {signal.type}
              </div>
              <div className="mt-2 text-sm">{signal.detail}</div>
              <div className="mt-2 text-xs text-slate">
                Impact: +{signal.impact}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
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
            Newsdata coverage
          </div>
          <div className="space-y-3">
            {newsdata.length === 0 && (
              <div className="card p-4 text-sm text-slate">
                No Newsdata coverage loaded yet.
              </div>
            )}
            {newsdata.map((article, index) => (
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
                  {article.pubDate ?? "Unknown date"}
                  {article.sourceId ? ` • ${article.sourceId}` : ""}
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
