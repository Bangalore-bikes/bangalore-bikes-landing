import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CommunityResources } from "@/components/common/community-resources";
import { communityResources } from "@/data/community-resources";

export const LatestFromBlog = () => (
  <section className="py-10" aria-labelledby="LatestFromBlog-title">
    <h2 id="LatestFromBlog-title" className="text-2xl font-bold sm:text-3xl">
      From r/BangaloreBikes
    </h2>
    <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">
      Start with these community notices and member discussions. Each link opens
      the original Reddit thread, with its author, comments, and context.
    </p>
    <div className="mt-8">
      {communityResources.length > 0 ? (
        <CommunityResources resources={communityResources} />
      ) : (
        <p>No community links have been published here yet.</p>
      )}
    </div>
    <Button asChild variant="outline" className="mt-6 min-h-11">
      <Link href="https://www.reddit.com/r/bangalorebikes/">
        Read discussions on Reddit
      </Link>
    </Button>
  </section>
);
