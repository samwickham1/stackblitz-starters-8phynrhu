import { companies } from "@/lib/data";
import { fetchGdelt, fetchNewsdataQuery, fetchWikidata } from "@/lib/external";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExternalSignal = {
  type: string;
  impact: number;
  detail: string;
};

function parseSeenDate(value?: string) {
  if (!value) return null;
  const raw = value.toString();
  if (raw.length < 8) return null;
  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const day = Number(raw.slice(6, 8));
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function scoreFromGdelt(articles: { seenDate?: string }[]) {
  const now = new Date();
  const recentWindow = 60;
  const recentCount = articles.filter((article) => {
    const date = parseSeenDate(article.seenDate);
    if (!date) return false;
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= recentWindow;
  }).length;

  const score = Math.min(20, recentCount * 3);
  const detail =
    recentCount > 0
      ? `${recentCount} articles in the last ${recentWindow} days`
      : "No recent media coverage detected";
  return { score, detail };
}

function scoreFromNewsdata(articles: { pubDate?: string }[]) {
  const now = new Date();
  const recentWindow = 60;
  const recentCount = articles.filter((article) => {
    if (!article.pubDate) return false;
    const date = new Date(article.pubDate);
    if (Number.isNaN(date.getTime())) return false;
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= recentWindow;
  }).length;

  const score = Math.min(20, recentCount * 3);
  const detail =
    recentCount > 0
      ? `${recentCount} Newsdata articles in the last ${recentWindow} days`
      : "No recent Newsdata coverage detected";
  return { score, detail };
}

function scoreFromWikidata(sponsorOf: unknown[]) {
  const count = sponsorOf.length;
  const score = Math.min(15, count * 3);
  const detail =
    count > 0
      ? `${count} sponsorship links found`
      : "No sponsorship links found in Wikidata";
  return { score, detail };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") ?? "";
  const nameOverride = searchParams.get("name") ?? "";

  const company =
    companies.find((item) => item.id === companyId) ??
    companies.find((item) => item.name.toLowerCase() === nameOverride.toLowerCase());

  const name = company?.name ?? nameOverride;

  if (!name) {
    return Response.json(
      { error: "Missing companyId or name parameter" },
      { status: 400 }
    );
  }

  try {
    const [gdelt, wikidata] = await Promise.all([
      fetchGdelt(name),
      fetchWikidata(name)
    ]);

    let newsdata = { articles: [] as { pubDate?: string }[] };
    try {
      newsdata = await fetchNewsdataQuery(name, 10);
    } catch {
      newsdata = { articles: [] as { pubDate?: string }[] };
    }

    const gdeltSignal = scoreFromGdelt(gdelt.articles);
    const newsdataSignal = scoreFromNewsdata(newsdata.articles);
    const wikiSignal = scoreFromWikidata(wikidata.sponsorOf);

    const externalSignals: ExternalSignal[] = [
      {
        type: "Media coverage",
        impact: gdeltSignal.score,
        detail: gdeltSignal.detail
      },
      {
        type: "Newsdata coverage",
        impact: newsdataSignal.score,
        detail: newsdataSignal.detail
      },
      {
        type: "Existing sponsorships",
        impact: wikiSignal.score,
        detail: wikiSignal.detail
      }
    ];

    const baseScore = company?.score ?? 50;
    const externalScore = externalSignals.reduce(
      (total, signal) => total + signal.impact,
      0
    );
    const totalScore = clampScore(baseScore + externalScore);

    return Response.json({
      companyId: company?.id ?? null,
      name,
      baseScore,
      externalScore,
      totalScore,
      externalSignals,
      gdelt: gdelt.articles,
      newsdata: newsdata.articles,
      wikidata: wikidata
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
