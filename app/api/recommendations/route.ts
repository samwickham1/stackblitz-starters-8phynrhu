import { fetchGdeltQuery, fetchNewsdataQuery, fetchWikidata } from "@/lib/external";
import { detectSignalsFromTitles, isDisallowedCandidate } from "@/lib/signalRules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_QUERY =
  '(sponsorship OR sponsor OR "naming rights" OR "official partner" OR "partnership" OR "brand partner" OR "jersey sponsor" OR "shirt sponsor")';

const STOPWORDS = new Set([
  "The",
  "A",
  "An",
  "And",
  "Or",
  "For",
  "With",
  "In",
  "On",
  "At",
  "To",
  "From",
  "By",
  "Of",
  "New",
  "Launches",
  "Announces",
  "Partners",
  "Partnership",
  "Sponsorship",
  "Sponsor",
  "Official",
  "League",
  "Club",
  "Team",
  "Cup",
  "Open",
  "Grand",
  "Prix",
  "Championship",
  "Tournament",
  "Series"
]);

const SPORTS_TERMS = new Set([
  "NFL",
  "NBA",
  "MLB",
  "NHL",
  "EPL",
  "ATP",
  "WTA",
  "F1",
  "UFC",
  "FIFA",
  "UEFA",
  "Formula",
  "Premier",
  "League",
  "Grand",
  "Prix"
]);

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeCandidate(value: string) {
  return value.replace(/^[“"']|[”"']$/g, "").replace(/\s+/g, " ").trim();
}

function isValidCandidate(value: string) {
  const cleaned = normalizeCandidate(value);
  if (!cleaned) return false;
  if (cleaned.length < 3) return false;
  if (STOPWORDS.has(cleaned)) return false;
  if (SPORTS_TERMS.has(cleaned)) return false;
  const words = cleaned.split(" ");
  if (words.length > 4) return false;
  if (words.length === 1) {
    if (cleaned.length < 4) return false;
    if (/^[A-Z]{2,4}$/.test(cleaned)) return false;
  }
  if (words.some((word) => STOPWORDS.has(word))) return false;
  return true;
}

function extractCandidates(articles: { title?: string; source: string }[]) {
  const map = new Map<
    string,
    {
      mentions: number;
      evidence: string[];
      titles: string[];
      sourceCounts: Record<string, number>;
    }
  >();

  for (const article of articles) {
    const title = article.title ?? "";
    const matches =
      title.match(/[A-Z][A-Za-z0-9&.'-]+(?:\s+[A-Z][A-Za-z0-9&.'-]+){0,3}/g) ??
      [];

    for (const raw of matches) {
      const candidate = normalizeCandidate(raw);
      if (!isValidCandidate(candidate)) continue;
      const entry = map.get(candidate) ?? {
        mentions: 0,
        evidence: [],
        titles: [],
        sourceCounts: {}
      };
      entry.mentions += 1;
      entry.sourceCounts[article.source] =
        (entry.sourceCounts[article.source] ?? 0) + 1;
      if (entry.evidence.length < 3 && title) {
        entry.evidence.push(title);
      }
      if (entry.titles.length < 12 && title) {
        entry.titles.push(title);
      }
      map.set(candidate, entry);
    }
  }

  return Array.from(map.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.mentions - a.mentions);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? DEFAULT_QUERY;

  const gdelt = await fetchGdeltQuery(query, 50);
  let newsdata = { articles: [] as { title?: string }[] };
  try {
    newsdata = await fetchNewsdataQuery(query, 10);
  } catch {
    newsdata = { articles: [] as { title?: string }[] };
  }

  const mergedArticles = [
    ...gdelt.articles.map((article) => ({ title: article.title, source: "gdelt" })),
    ...newsdata.articles.map((article) => ({
      title: article.title,
      source: "newsdata"
    }))
  ];

  const candidates = extractCandidates(mergedArticles).slice(0, 12);

  const results = [];

  for (const candidate of candidates) {
    if (isDisallowedCandidate(candidate.name)) {
      continue;
    }

    const signals = detectSignalsFromTitles(candidate.titles);
    const hasPrioritySignal = signals.some((signal) =>
      ["funding", "geo", "cmo"].includes(signal.type)
    );
    if (!hasPrioritySignal) {
      continue;
    }

    const hasMultiSource =
      (candidate.sourceCounts.gdelt ?? 0) > 0 &&
      (candidate.sourceCounts.newsdata ?? 0) > 0;
    if (candidate.mentions < 2 && !hasMultiSource) {
      continue;
    }

    const wikidata = await fetchWikidata(candidate.name);
    if (!wikidata.entity) {
      continue;
    }
    const sponsorLinks = wikidata.sponsorOf.length;
    const mediaScore = Math.min(25, candidate.mentions * 4);
    const sponsorScore = Math.min(20, sponsorLinks * 4);
    const entityScore = 5;
    const signalScore = Math.min(
      30,
      signals.reduce((total, signal) => total + signal.weight, 0)
    );
    const totalScore = clampScore(
      35 + mediaScore + sponsorScore + signalScore + entityScore
    );

    results.push({
      name: candidate.name,
      totalScore,
      mediaMentions: candidate.mentions,
      gdeltMentions: candidate.sourceCounts.gdelt ?? 0,
      newsdataMentions: candidate.sourceCounts.newsdata ?? 0,
      sponsorLinks,
      signals,
      evidence: candidate.evidence,
      entity: wikidata.entity
    });
  }

  results.sort((a, b) => b.totalScore - a.totalScore);

  return Response.json({
    updatedAt: new Date().toISOString(),
    query,
    results
  });
}
