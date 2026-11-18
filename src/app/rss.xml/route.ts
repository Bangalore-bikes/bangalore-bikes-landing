import { getPostsClient, hasDatabaseConfig } from "@/lib/db";
import { listPublished } from "@/lib/posts/repository";
import { siteName, siteOrigin } from "@/lib/siteMetadata";

export const runtime = "nodejs";
export const revalidate = 300;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const feedUrl = `${siteOrigin}/rss.xml`;
  const description =
    "Ride reports, routes and workshop notes written by the Bangalore Bikes community.";

  let items = "";
  if (hasDatabaseConfig()) {
    try {
      const posts = await listPublished(getPostsClient(), { limit: 20 });
      items = posts
        .map((post) => {
          const url = `${siteOrigin}/posts/${post.slug}`;
          return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${new Date(post.publishedAt ?? post.updatedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.summary)}</description>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n")}
    </item>`;
        })
        .join("\n");
    } catch {
      items = "";
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)} — rider posts</title>
    <link>${escapeXml(`${siteOrigin}/posts`)}</link>
    <description>${escapeXml(description)}</description>
    <language>en-in</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
