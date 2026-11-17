import { unstable_cache } from "next/cache";
import { parseRedditFeed } from "@/lib/communityFeed";
import { communityHighlights } from "@/data/community-posts";

// Cache failures too, so a blocked/rate-limited feed is not retried per visitor.
export const getCommunityFeed = unstable_cache(
  async (sort: "hot" | "new") => {
    const checkedAt = new Date().toISOString();
    try {
      const response = await fetch(
        "https://www.reddit.com/r/bangalorebikes/" + sort + "/.rss?limit=6",
        {
          headers: {
            "User-Agent":
              "BangaloreBikesWebsite/1.0 (+https://bangalorebikes.com)",
          },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        },
      );
      if (!response.ok) throw new Error("Community feed unavailable");
      const posts = parseRedditFeed(await response.text());
      if (!posts.length) throw new Error("No usable community posts");
      return { mode: "live" as const, sort, checkedAt, posts };
    } catch {
      return {
        mode: "highlights" as const,
        sort,
        checkedAt,
        posts: communityHighlights,
      };
    }
  },
  ["bangalore-bikes-community-feed-v1"],
  { revalidate: 300 },
);
