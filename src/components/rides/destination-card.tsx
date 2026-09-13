import Image from "next/image";

import type { Destination } from "@/data/destinations";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <article
      data-reveal=""
      className="flex flex-col overflow-hidden rounded-card border border-line bg-bg"
    >
      <div className="relative aspect-4/3">
        <Image
          src={destination.src}
          alt={destination.alt}
          fill
          sizes="(max-width: 860px) 100vw, 33vw"
          className="object-cover"
        />
        <span className="pointer-events-none absolute top-3.5 right-3.5 rounded-full border border-line bg-bg px-2.5 py-1.5 text-xs font-semibold text-fg">
          {destination.level}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display m-0 text-lg font-bold tracking-[-0.02em]">
            {destination.name}
          </h3>
          <span className="font-display font-bold whitespace-nowrap text-acc">
            {destination.km}
          </span>
        </div>
        <div className="text-sm text-fg2">
          {destination.type} · {destination.dur} · Best {destination.best}
        </div>
        <p className="m-0 text-sm leading-relaxed text-fg2">
          {destination.desc}
        </p>
      </div>
    </article>
  );
}
