import Link from "next/link";

import { Container } from "@/components/common/section";
import { LINKS } from "@/data/site";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60svh] flex-col items-start justify-center py-25">
      <div className="mb-4.5 text-[13px] font-semibold tracking-[0.18em] text-acc uppercase">
        404 · wrong turn
      </div>
      <h1 className="font-display m-0 mb-6 text-[clamp(40px,8vw,112px)] leading-[0.92] font-black tracking-[-0.04em] uppercase">
        Road not
        <br />
        found.
      </h1>
      <p className="m-0 mb-9 max-w-[520px] text-[17px] leading-relaxed text-fg2">
        This page never existed, or it was retired. Head back to the start, or
        ask the community.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex h-13 items-center rounded-full bg-acc px-6 text-[15px] font-bold text-acc-fg"
        >
          Back home →
        </Link>
        <a
          href={LINKS.reddit}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-13 items-center rounded-full border border-line px-6 text-[15px] font-bold transition-colors hover:border-acc"
        >
          r/bangalorebikes ↗
        </a>
      </div>
    </Container>
  );
}
