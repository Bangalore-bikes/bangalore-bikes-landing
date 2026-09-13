import Image from "next/image";

import type { Ride } from "@/data/rides";

/** Upcoming-ride card used on the home page teaser grid. */
export function RideCard({ ride }: { ride: Ride }) {
  return (
    <article
      data-reveal=""
      className="flex flex-col overflow-hidden rounded-card border border-line bg-bg"
    >
      <div className="relative aspect-4/3">
        <Image
          src={ride.src}
          alt={ride.alt}
          fill
          sizes="(max-width: 860px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute top-3.5 left-3.5 flex gap-2">
          <span className="rounded-full bg-acc px-2.5 py-1.5 text-xs font-bold text-acc-fg">
            {ride.type}
          </span>
          <span className="rounded-full border border-line bg-bg px-2.5 py-1.5 text-xs font-semibold text-fg">
            {ride.level}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-5.5">
        <div className="flex items-start gap-4">
          <div className="min-w-13 rounded-xl border border-line px-1.5 py-2 text-center">
            <div className="font-display text-xl leading-none font-bold">
              {ride.day}
            </div>
            <div className="mt-1 text-[11px] tracking-[0.12em] text-fg2 uppercase">
              {ride.mon}
            </div>
          </div>
          <div>
            <h3 className="font-display m-0 mb-1.5 text-lg font-bold tracking-[-0.02em]">
              {ride.title}
            </h3>
            <div className="text-sm text-fg2">{ride.meta}</div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-3.5 text-sm">
          <span className="text-fg2">Meet · {ride.meet}</span>
          <span className="font-bold">{ride.time}</span>
        </div>
      </div>
    </article>
  );
}
