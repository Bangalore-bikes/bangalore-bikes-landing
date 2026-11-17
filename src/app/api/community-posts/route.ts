import { getCommunityFeed } from "@/lib/reddit-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sort = new URL(request.url).searchParams.get("sort") ?? "hot";
  if (sort !== "hot" && sort !== "new")
    return Response.json(
      { error: "Choose hot or new posts" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  return Response.json(await getCommunityFeed(sort), {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
