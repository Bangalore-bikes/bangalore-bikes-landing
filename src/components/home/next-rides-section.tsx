import { ArrowLink, Container } from "@/components/common/section";
import { RideCard } from "@/components/rides/ride-card";
import { UPCOMING_RIDES } from "@/data/rides";

export function NextRidesSection() {
  return (
    <section className="border-y border-line bg-bg2">
      <Container className="py-24">
        <div
          data-reveal=""
          className="mb-11 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <h2 className="font-display m-0 text-[clamp(30px,4.5vw,56px)] leading-none font-bold tracking-[-0.03em] uppercase">
            Next rides
          </h2>
          <ArrowLink href="/rides">All rides</ArrowLink>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {UPCOMING_RIDES.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      </Container>
    </section>
  );
}
