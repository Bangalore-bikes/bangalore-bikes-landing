import type { Metadata } from "next";

import { Container } from "@/components/common/section";
import { DestinationCard } from "@/components/rides/destination-card";
import { NextRidePanel } from "@/components/rides/next-ride-panel";
import { DESTINATIONS } from "@/data/destinations";
import { NEXT_RIDE, PLANNED_RIDES, RIDE_GUIDES } from "@/data/rides";

export const metadata: Metadata = {
  title: "Rides",
  description:
    "The next group ride, what else is being planned, the places we ride to and what to sort out before you join.",
};

export default function RidesPage() {
  return (
    <>
      <Container className="pt-20 pb-12">
        <div className="mb-4.5 flex items-center gap-3">
          <span className="relative block h-3 w-3">
            <span className="absolute inset-0 rounded-full bg-acc" />
            <span className="animate-ring absolute inset-0 rounded-full bg-acc" />
          </span>
          <span className="text-[13px] font-semibold tracking-[0.18em] text-acc uppercase">
            Next ride
          </span>
        </div>

        <h1 className="font-display m-0 mb-12 text-[clamp(40px,8vw,112px)] leading-[0.92] font-black tracking-[-0.04em] uppercase">
          {NEXT_RIDE.title}
        </h1>

        <NextRidePanel ride={NEXT_RIDE} />
      </Container>

      {PLANNED_RIDES.length > 0 ? (
        <Container className="pt-6 pb-20">
          <div className="mb-4.5 flex items-center gap-5">
            <h2 className="font-display m-0 text-xl font-bold tracking-[-0.02em] uppercase">
              Also being planned
            </h2>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="flex flex-col gap-2">
            {PLANNED_RIDES.map((ride) => (
              <div
                key={ride.id}
                data-reveal=""
                className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-line bg-bg2 px-6 py-5 transition-colors hover:border-acc md:grid-cols-[90px_1fr_auto]"
              >
                <div>
                  <div className="font-display text-[28px] leading-none font-bold">
                    {ride.day}
                  </div>
                  <div className="text-xs tracking-[0.12em] text-fg2 uppercase">
                    {ride.mon} · {ride.dow}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-bg3 px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] text-fg uppercase">
                      {ride.level}
                    </span>
                    <span className="text-[13px] text-fg2">
                      {ride.time} · {ride.meet} · {ride.meta}
                    </span>
                  </div>
                  <div className="text-lg font-bold">{ride.title}</div>
                </div>
                <span className="text-[13px] whitespace-nowrap text-fg2">
                  Details in WhatsApp
                </span>
              </div>
            ))}
          </div>
        </Container>
      ) : null}

      <section className="border-t border-line bg-bg2">
        <Container className="py-20">
          <div
            data-reveal=""
            className="mb-9 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
          >
            <h2 className="font-display m-0 text-[clamp(26px,3vw,40px)] leading-tight font-bold tracking-[-0.03em] uppercase">
              Places we ride
            </h2>
            <p className="m-0 max-w-[380px] text-[15px] leading-relaxed text-fg2">
              Where the group usually ends up. Distances from the city centre,
              one way. Vote for the next one on Reddit.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </Container>
      </section>

      <Container className="pt-20 pb-25">
        <h2
          data-reveal=""
          className="font-display m-0 mb-9 text-[clamp(26px,3vw,40px)] font-bold tracking-[-0.03em] uppercase"
        >
          Before you join a ride
        </h2>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {RIDE_GUIDES.map((guide) => (
            <div
              key={guide.title}
              data-reveal=""
              className="rounded-[18px] border border-line bg-bg2 p-6.5"
            >
              <div className="font-display mb-4 text-[17px] font-bold tracking-[-0.02em]">
                {guide.title}
              </div>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {guide.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-[15px] leading-snug text-fg2"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-acc" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
