import { companies } from "@/lib/data";
import { fetchGdelt, fetchWikidata } from "@/lib/external";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

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
  return Math.min(20, recentCount * 3);
}

function scoreFromWikidata(sponsorOf: unknown[]) {
  return Math.min(15, sponsorOf.length * 3);
}

export async function GET() {
  const results = [];

  for (const company of companies) {
    const [gdelt, wikidata] = await Promise.all([
      fetchGdelt(company.name),
      fetchWikidata(company.name)
    ]);

    const externalScore =
      scoreFromGdelt(gdelt.articles) + scoreFromWikidata(wikidata.sponsorOf);
    const totalScore = clampScore(company.score + externalScore);

    results.push({
      id: company.id,
      name: company.name,
      industry: company.industry,
      region: company.region,
      baseScore: company.score,
      externalScore,
      totalScore,
      rightsFit: company.rightsFit
    });
  }

  results.sort((a, b) => b.totalScore - a.totalScore);

  return Response.json({
    updatedAt: new Date().toISOString(),
    results
  });
}
