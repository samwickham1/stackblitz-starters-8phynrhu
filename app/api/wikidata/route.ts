type WikidataEntity = {
  id: string;
  label: string;
  description?: string;
  url: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? searchParams.get("q");

  if (!query) {
    return Response.json(
      { error: "Missing query parameter" },
      { status: 400 }
    );
  }

  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      query
    )}&language=en&format=json&limit=1`;

    const searchResponse = await fetch(searchUrl, {
      headers: {
        "User-Agent": "signal-scout/0.1"
      },
      cache: "no-store"
    });

    if (!searchResponse.ok) {
      return Response.json(
        { error: "Failed to search Wikidata" },
        { status: searchResponse.status }
      );
    }

    const searchData = await searchResponse.json();
    const hit = searchData.search?.[0];

    if (!hit) {
      return Response.json({
        query,
        entity: null,
        sponsorOf: [],
        fetchedAt: new Date().toISOString()
      });
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
      return Response.json(
        { error: "Failed to query Wikidata sponsorships" },
        { status: sparqlResponse.status }
      );
    }

    const sparqlData = await sparqlResponse.json();
    const sponsorOf = (sparqlData.results?.bindings ?? []).map(
      (row: any) => {
        const itemUrl = row.item?.value ?? "";
        const id = itemUrl.split("/").pop() ?? itemUrl;
        return {
          id,
          label: row.itemLabel?.value ?? id,
          url: itemUrl || `https://www.wikidata.org/wiki/${id}`,
          instance: row.instanceLabel?.value
        };
      }
    );

    return Response.json({
      query,
      entity,
      sponsorOf,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
