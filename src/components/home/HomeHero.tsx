import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CountUp } from "@/components/motion/count-up";

export function HomeHero({
  stats,
}: {
  stats: Array<{ label: string; value: number }>;
}) {
  return (
    <section className="relative isolate mt-4 overflow-hidden rounded-2xl lg:mt-12">
      <Image
        src="/hero-banner.png"
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 75vw, 100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/60 to-background" />
      <div
        aria-hidden="true"
        className="hero-glow absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-dixie/25 blur-3xl"
      />

      <div className="px-5 pb-8 pt-16 text-white sm:px-10 lg:pb-12 lg:pt-28">
        <p
          className="hero-rise text-sm font-medium uppercase tracking-[0.2em] text-dixie"
          style={{ animationDelay: "0ms" }}
        >
          Namma Bengaluru · riders first
        </p>
        <h1
          className="hero-rise mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl"
          style={{ animationDelay: "100ms" }}
        >
          Find your next ride out of <span className="text-dixie">Bangalore</span>.
        </h1>
        <p
          className="hero-rise mt-5 max-w-xl text-lg leading-relaxed text-white/85"
          style={{ animationDelay: "200ms" }}
        >
          Pick a distance and a month, read what riders recorded, then join the people who
          show up on Sunday mornings.
        </p>
        <div
          className="hero-rise mt-8 flex flex-wrap gap-3"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="#plan"
            className="inline-flex min-h-12 items-center gap-2 rounded-md bg-dixie px-6 font-semibold text-black transition-transform hover:-translate-y-0.5"
          >
            Plan a ride <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/join"
            className="inline-flex min-h-12 items-center rounded-md border border-white/40 px-6 font-semibold text-white transition-colors hover:border-dixie hover:text-dixie"
          >
            Join the community
          </Link>
        </div>

        <dl
          className="hero-rise mt-12 grid max-w-md grid-cols-2 gap-4 border-t border-white/20 pt-6"
          style={{ animationDelay: "420ms" }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs uppercase tracking-wider text-white/60">{stat.label}</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums sm:text-4xl">
                <CountUp value={stat.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
