import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { communityLinks } from "@/lib/community";

interface CommunityPageProps {
  title: string;
  description: string;
  children?: ReactNode;
  actionLabel?: string;
  actionUrl?: string;
}

export function CommunityPage({
  title,
  description,
  children,
  actionLabel = "Visit r/BangaloreBikes",
  actionUrl = communityLinks.subreddit,
}: CommunityPageProps) {
  return (
    <main className="mx-auto w-full max-w-3xl py-12 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-5 max-w-prose text-lg leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && (
        <div className="mt-8 space-y-6 leading-relaxed">{children}</div>
      )}
      <div className="mt-8">
        <Button
          asChild
          className="h-auto min-h-11 whitespace-normal text-center"
        >
          <a href={actionUrl}>{actionLabel}</a>
        </Button>
      </div>
    </main>
  );
}
