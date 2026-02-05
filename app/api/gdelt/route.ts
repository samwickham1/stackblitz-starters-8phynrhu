import { fetchGdelt } from "@/lib/external";

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
    const { articles } = await fetchGdelt(query);
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
