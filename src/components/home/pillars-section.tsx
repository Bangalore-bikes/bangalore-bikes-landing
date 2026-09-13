import Link from "next/link";

import { Container } from "@/components/common/section";
import { PILLARS } from "@/data/pillars";

export function PillarsSection() {
  return (
    <Container className="py-24">
      <div
        data-reveal=""
        className="mb-11 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
      >
        <h2 className="font-display m-0 max-w-[640px] text-[clamp(30px,4.5vw,56px)] leading-none font-bold tracking-[-0.03em] uppercase">
          Everything a rider needs. Nothing else.
        </h2>
        <p className="m-0 max-w-[360px] text-base leading-relaxed text-fg2">
          Built by the community, for the community. Open source, on Reddit, on
          WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar) => (
          <Link
            key={pillar.num}
            href={pillar.href}
            data-reveal=""
            className="flex min-h-[260px] flex-col justify-between rounded-card border border-line bg-bg2 p-6.5 transition-[transform,border-color] duration-350 hover:-translate-y-1.5 hover:border-acc"
          >
            <div className="flex items-start justify-between">
              <span className="font-display text-xs text-fg2">
                {pillar.num}
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-line text-base">
                →
              </span>
            </div>
            <div>
              <h3 className="font-display m-0 mb-2.5 text-xl font-bold tracking-[-0.02em]">
                {pillar.title}
              </h3>
              <p className="m-0 text-[15px] leading-relaxed text-fg2">
                {pillar.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
