import Image from "next/image";

import type { RideDetail } from "@/data/rides";
import { LINKS } from "@/data/site";

export function NextRidePanel({ ride }: { ride: RideDetail }) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-line">
        <Image
          src={ride.src}
          alt={ride.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute top-4.5 left-4.5 flex gap-2">
          <span className="rounded-full bg-acc px-3 py-1.5 text-xs font-bold text-acc-fg">
            {ride.type}
          </span>
          <span className="rounded-full border border-line bg-bg px-3 py-1.5 text-xs font-semibold text-fg">
            {ride.level}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 rounded-3xl border border-line bg-bg2 p-6 md:p-9">
        <div className="flex items-center gap-5">
          <div className="min-w-19 rounded-2xl border border-line px-2 py-3 text-center">
            <div className="font-display text-[34px] leading-none font-black">
              {ride.day}
            </div>
            <div className="mt-1.5 text-xs tracking-[0.12em] text-fg2 uppercase">
              {ride.mon} · {ride.dow}
            </div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold tracking-[-0.02em]">
              {ride.time}
            </div>
            <div className="mt-1 text-[15px] text-fg2">Meet · {ride.meet}</div>
          </div>
        </div>

        <p className="m-0 text-[17px] leading-relaxed">{ride.desc}</p>

        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {ride.facts.map((fact) => (
            <div key={fact.k} className="bg-bg2 px-4.5 py-4">
              <div className="text-[11px] font-bold tracking-[0.12em] text-fg2 uppercase">
                {fact.k}
              </div>
              <div className="font-display mt-1.5 text-[17px] font-bold tracking-[-0.02em]">
                {fact.v}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {ride.plan.map((step) => (
            <div
              key={step.t}
              className="flex items-start gap-3.5 text-[15px] leading-snug"
            >
              <span className="font-display min-w-13 pt-0.5 text-xs font-bold text-acc">
                {step.t}
              </span>
              <span className="text-fg2">{step.s}</span>
            </div>
          ))}
        </div>

        <a
          href={LINKS.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex h-14 items-center justify-center rounded-full bg-fg text-[15px] font-bold text-bg transition-colors hover:bg-acc hover:text-acc-fg"
        >
          I&apos;m in · say so on WhatsApp →
        </a>
      </div>
    </div>
  );
}
