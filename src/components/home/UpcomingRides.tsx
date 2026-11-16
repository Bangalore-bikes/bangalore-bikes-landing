import Link from "next/link";
import { Button } from "@/components/ui/button";

export const UpcomingRides = () => (
  <section className="py-10" aria-labelledby="UpcomingRides-title">
    <h2 id="UpcomingRides-title" className="text-2xl font-bold sm:text-3xl">
      Upcoming rides
    </h2>
    <p className="mt-4 max-w-prose leading-relaxed text-muted-foreground">
      No confirmed rides are listed on the website yet. Check ride discussions
      and confirm plans with the organizer before setting off.
    </p>
    <Button asChild variant="outline" className="mt-6 min-h-11">
      <Link href="/rides">Explore community rides</Link>
    </Button>
  </section>
);
