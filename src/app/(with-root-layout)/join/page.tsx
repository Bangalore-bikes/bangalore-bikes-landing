import { WhatsAppJoin } from "@/components/common/whatsapp-join";
import { communityLinks } from "@/lib/community";
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("/join");

export default function JoinPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-2 py-10 sm:px-0 sm:py-16">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Find your riding community.
      </h1>
      <p className="mt-5 max-w-prose text-lg leading-relaxed text-muted-foreground">
        All motorcycles, all experience levels. Choose how you want to stay in
        touch with Bangalore Bikes.
      </p>
      <WhatsAppJoin />
      <section className="border-t border-border py-8">
        <h2 className="text-2xl font-semibold">Prefer to stay on Reddit?</h2>
        <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">
          Read discussions and share experiences without joining a
          phone-number-based group.
        </p>
        <a
          href={communityLinks.subreddit}
          className="mt-4 inline-flex min-h-11 items-center underline underline-offset-4"
        >
          Visit r/BangaloreBikes
        </a>
      </section>
    </main>
  );
}
