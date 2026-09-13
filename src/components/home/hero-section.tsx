import { SITE } from "@/data/site";

import { HeroVideo } from "./hero-video";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[92svh] items-end overflow-hidden">
      <div className="absolute inset-0 bg-bg3">
        <HeroVideo />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--bg)_8%,color-mix(in_oklab,var(--bg)_55%,transparent)_55%,transparent_100%)] shadow-[inset_0_-80px_160px_-40px_var(--bg),inset_0_0_200px_rgba(0,0,0,.45)]"
      />

      <div className="pointer-events-none relative mx-auto w-full max-w-[1280px] px-5 pt-30 pb-18 md:px-10">
        <div className="animate-rise mb-6 flex items-center gap-3 [animation-delay:0.1s]">
          <span className="block h-0.5 w-11 bg-acc" />
          <span className="text-[13px] font-semibold tracking-[0.18em] text-fg2 uppercase">
            {SITE.subreddit} · since {SITE.since}
          </span>
        </div>

        <h1 className="font-display m-0 text-[clamp(44px,9vw,132px)] leading-[0.92] font-black tracking-[-0.04em] uppercase">
          <span className="animate-rise block [animation-delay:0.2s]">
            Ride
          </span>
          <span className="animate-rise block text-acc [animation-delay:0.35s]">
            Namma
          </span>
          <span className="animate-rise block [animation-delay:0.5s]">
            Bengaluru.
          </span>
        </h1>

        <p className="animate-rise m-0 mt-10 max-w-[520px] text-[clamp(17px,1.6vw,21px)] leading-relaxed text-fg2 [animation-delay:0.7s]">
          {SITE.tagline}
        </p>
      </div>
    </section>
  );
}
