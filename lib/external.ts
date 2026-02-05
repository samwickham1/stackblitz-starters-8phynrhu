type GdeltArticle = {
  title: string;
  url: string;
  seenDate?: string;
  sourceCountry?: string;
  domain?: string;
};

type WikidataEntity = {
  id: string;
  label: string;
  description?: string;
  url: string;
};

type WikidataSponsorship = {
  id: string;
  label: string;
  url: string;
  instance?: string;
};

type NewsdataArticle = {
  title: string;
  url: string;
  pubDate?: string;
  sourceId?: string;
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 30 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

function setCached<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export async function fetchGdeltQuery(query: string, maxRecords = 25) {
  const cacheKey = `gdelt:${query.toLowerCase()}:${maxRecords}`;
  const cached = getCached<{ articles: GdeltArticle[] }>(cacheKey);
  if (cached) return cached;

  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(
    query
  )}&mode=ArtList&maxrecords=${maxRecords}&format=json`;

  const response = await fetch(url, {
    headers: { "User-Agent": "signal-scout/0.1" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`GDELT error ${response.status}`);
  }

  const data = await response.json();
  const articles = (data.articles ?? []).map((article: any) => ({
    title: article.title ?? "Untitled article",
    url: article.url,
    seenDate: article.seendate,
    sourceCountry: article.sourcecountry,
    domain: article.domain
  }));

  const payload = { articles };
  setCached(cacheKey, payload);
  return payload;
}

export async function fetchGdelt(companyName: string) {
  return fetchGdeltQuery(companyName, 25);
}

export async function fetchNewsdataQuery(query: string, maxRecords = 10) {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEWSDATA_API_KEY");
  }

  const cacheKey = `newsdata:${query.toLowerCase()}:${maxRecords}`;
  const cached = getCached<{ articles: NewsdataArticle[] }>(cacheKey);
  if (cached) return cached;

  const size = Math.max(1, Math.min(10, maxRecords));
  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${encodeURIComponent(
    query
  )}&language=en&size=${size}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "signal-scout/0.1" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Newsdata error ${response.status}`);
  }

  const data = await response.json();
  const rawResults = data.results ?? data.data ?? [];
  const articles = rawResults
    .map((item: any) => ({
      title: item.title ?? "Untitled article",
      url: item.link ?? item.url ?? "",
      pubDate: item.pubDate,
      sourceId: item.source_id ?? item.source
    }))
    .filter((item: NewsdataArticle) => item.url)
    .slice(0, size);

  const payload = { articles };
  setCached(cacheKey, payload);
  return payload;
}

export async function fetchWikidata(companyName: string) {
  const cacheKey = `wikidata:${companyName.toLowerCase()}`;
  const cached = getCached<{
    entity: WikidataEntity | null;
    sponsorOf: WikidataSponsorship[];
  }>(cacheKey);
  if (cached) return cached;

  const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
    companyName
  )}&language=en&format=json&limit=1`;

  const searchResponse = await fetch(searchUrl, {
    headers: { "User-Agent": "signal-scout/0.1" },
    cache: "no-store"
  });

  if (!searchResponse.ok) {
    throw new Error(`Wikidata search error ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json();
  const hit = searchData.search?.[0];

  if (!hit) {
    const payload = { entity: null, sponsorOf: [] as WikidataSponsorship[] };
    setCached(cacheKey, payload);
    return payload;
  }

  const entity: WikidataEntity = {
    id: hit.id,
    label: hit.label,
    description: hit.description,
    url: `https://www.wikidata.org/wiki/${hit.id}`
  };

  const sparql = `
    SELECT ?item ?itemLabel ?instanceLabel WHERE {
      ?item wdt:P859 wd:${hit.id}.
      OPTIONAL { ?item wdt:P31 ?instance. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 10
  `;

  const sparqlUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(
    sparql
  )}`;

  const sparqlResponse = await fetch(sparqlUrl, {
    headers: {
      "User-Agent": "signal-scout/0.1",
      Accept: "application/sparql+json"
    },
    cache: "no-store"
  });

  if (!sparqlResponse.ok) {
    throw new Error(`Wikidata SPARQL error ${sparqlResponse.status}`);
  }

  const sparqlData = await sparqlResponse.json();
  const sponsorOf = (sparqlData.results?.bindings ?? []).map((row: any) => {
    const itemUrl = row.item?.value ?? "";
    const id = itemUrl.split("/").pop() ?? itemUrl;
    return {
      id,
      label: row.itemLabel?.value ?? id,
      url: itemUrl || `https://www.wikidata.org/wiki/${id}`,
      instance: row.instanceLabel?.value
    };
  });

  const payload = { entity, sponsorOf };
  setCached(cacheKey, payload);
  return payload;
}
