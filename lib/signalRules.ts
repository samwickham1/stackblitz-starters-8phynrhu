export type SignalType = "funding" | "geo" | "cmo" | "sponsorship";

const FUNDING_PATTERNS = [
  /\bseries\s+[A-E]\b/i,
  /\bseed\b/i,
  /\bpre-seed\b/i,
  /\bfunding\b/i,
  /\bfinancing\b/i,
  /\braises?\b/i,
  /\bround\b/i,
  /\binvestment\b/i,
  /\bbacked\b/i,
  /\bventure\b/i,
  /\bvaluation\b/i,
  /\bIPO\b/i,
  /\bcapital\b/i,
  /\bstrategic investment\b/i,
  /\bprivate equity\b/i,
  /\b\$?\d+(?:\.\d+)?\s?(?:million|billion|m|bn)\b/i
];

const GEO_PATTERNS = [
  /\bexpands?\b/i,
  /\bexpansion\b/i,
  /\benters?\b/i,
  /\blaunches?\s+in\b/i,
  /\bopens?\s+(office|hq|hub|facility)\b/i,
  /\bnew market\b/i,
  /\binternational\b/i,
  /\bglobal\b/i,
  /\bAPAC\b/i,
  /\bEMEA\b/i,
  /\bLATAM\b/i,
  /\bEurope\b/i,
  /\bAsia\b/i,
  /\bMiddle East\b/i,
  /\bUS\b/i,
  /\bUK\b/i,
  /\bCanada\b/i,
  /\bAustralia\b/i,
  /\bIndia\b/i,
  /\bJapan\b/i,
  /\bChina\b/i,
  /\bBrazil\b/i
];

const CMO_PATTERNS = [
  /\bCMO\b/i,
  /\bChief Marketing Officer\b/i,
  /\bChief Brand Officer\b/i,
  /\bChief Growth Officer\b/i,
  /\bmarketing chief\b/i,
  /\bmarketing officer\b/i,
  /\bappoints?\s+CMO\b/i,
  /\bhires?\s+CMO\b/i,
  /\bnames?\s+CMO\b/i
];

const SPONSOR_PATTERNS = [
  /\bsponsor\b/i,
  /\bsponsorship\b/i,
  /\bofficial partner\b/i,
  /\bnaming rights\b/i,
  /\bbrand partner\b/i,
  /\bjersey sponsor\b/i,
  /\bshirt sponsor\b/i
];

const TEAM_LEAGUE_REGEX = /\b(FC|CF|SC|AFC|Club|United|City|Town|Rovers|Athletic|Athletics|Sporting|Rangers|Warriors|Giants|Lions|Tigers|Wolves|Jets|Stars|League|Cup|Series|Championship|Premier League|La Liga|Serie A|Bundesliga|MLS|NASCAR|NCAA|NFL|NBA|MLB|NHL|UEFA|FIFA|ATP|WTA|Formula 1|F1|UFC)\b/i;
const HEALTH_REGEX = /\b(Health|Healthcare|Hospital|Clinic|Medical|Pharma|Pharmaceutical|Biotech|Therapeutics|Diagnostics|Wellness|Care|Laboratory|Labs?)\b/i;

export const SIGNAL_WEIGHTS: Record<SignalType, number> = {
  funding: 14,
  geo: 10,
  cmo: 16,
  sponsorship: 8
};

export function isDisallowedCandidate(name: string) {
  if (TEAM_LEAGUE_REGEX.test(name)) return true;
  if (HEALTH_REGEX.test(name)) return true;
  return false;
}

export function detectSignalsFromTitles(titles: string[]) {
  const signals = new Map<SignalType, { type: SignalType; matches: string[] }>();

  for (const title of titles) {
    if (FUNDING_PATTERNS.some((pattern) => pattern.test(title))) {
      const entry = signals.get("funding") ?? { type: "funding", matches: [] };
      if (entry.matches.length < 3) entry.matches.push(title);
      signals.set("funding", entry);
    }
    if (GEO_PATTERNS.some((pattern) => pattern.test(title))) {
      const entry = signals.get("geo") ?? { type: "geo", matches: [] };
      if (entry.matches.length < 3) entry.matches.push(title);
      signals.set("geo", entry);
    }
    if (CMO_PATTERNS.some((pattern) => pattern.test(title))) {
      const entry = signals.get("cmo") ?? { type: "cmo", matches: [] };
      if (entry.matches.length < 3) entry.matches.push(title);
      signals.set("cmo", entry);
    }
    if (SPONSOR_PATTERNS.some((pattern) => pattern.test(title))) {
      const entry =
        signals.get("sponsorship") ?? { type: "sponsorship", matches: [] };
      if (entry.matches.length < 3) entry.matches.push(title);
      signals.set("sponsorship", entry);
    }
  }

  return Array.from(signals.values()).map((signal) => ({
    ...signal,
    weight: SIGNAL_WEIGHTS[signal.type]
  }));
}
