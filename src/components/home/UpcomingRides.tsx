import Link from "next/link";

import { RideDirectory } from "@/components/rides/ride-directory";
import { Button } from "@/components/ui/button";
import { getRides } from "@/lib/content-source";

export async function UpcomingRides() {
  const rides = await getRides();
  return (
    <section className="py-10" aria-labelledby="UpcomingRides-title">
      <h2 id="UpcomingRides-title" className="text-2xl font-bold sm:text-3xl">
        Upcoming rides
      </h2>
      <div className="mt-4 max-w-prose leading-relaxed">
        <RideDirectory rides={rides} upcomingOnly />
      </div>
      <Button asChild variant="outline" className="mt-6 min-h-11">
        <Link href="/rides">Explore community rides</Link>
      </Button>
    </section>
  );
}
