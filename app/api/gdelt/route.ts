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

  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(
    query
  )}&mode=ArtList&maxrecords=10&format=json`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "signal-scout/0.1"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch from GDELT" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const articles = (data.articles ?? []).map((article: any) => ({
      title: article.title ?? "Untitled article",
      url: article.url,
      seenDate: article.seendate,
      sourceCountry: article.sourcecountry,
      domain: article.domain
    }));

    return Response.json({
      query,
      articles,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
