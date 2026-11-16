import Link from "next/link";
import { communityLinks } from "@/lib/community";

export const Footer = () => (
  <footer className="mx-auto mt-8 mb-4 flex w-full flex-col items-center gap-4 border-t border-border px-4 pt-6">
    <nav
      aria-label="Footer"
      className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm"
    >
      <a
        href={communityLinks.subreddit}
        className="underline underline-offset-4"
      >
        r/BangaloreBikes
      </a>
      <Link href="/contact" className="underline underline-offset-4">
        Contact moderators
      </Link>
    </nav>
    <p className="text-center text-xs text-muted-foreground">
      A community home for motorcycle riders in Bengaluru. All brands welcome.
    </p>
  </footer>
);
