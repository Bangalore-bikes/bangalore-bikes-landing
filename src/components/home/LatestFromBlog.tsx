import Link from "next/link";
import { Button } from "@/components/ui/button";

export const LatestFromBlog = () => (
  <section className="py-10" aria-labelledby="LatestFromBlog-title">
    <h2 id="LatestFromBlog-title" className="text-2xl font-bold sm:text-3xl">
      Stories from the community
    </h2>
    <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">
      Ride reports, questions, and conversations live on r/BangaloreBikes. There
      are no published articles on this website yet.
    </p>
    <Button asChild variant="outline" className="mt-6 min-h-11">
      <Link href="https://www.reddit.com/r/bangalorebikes/">
        Read discussions on Reddit
      </Link>
    </Button>
  </section>
);
