import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rides } from "@/data/rides";
import { formatRideDate } from "@/lib/rides";
import { isPreviewDeployment, siteOrigin } from "@/lib/siteMetadata";
import { Button } from "@/components/ui/button";
import { RideAvailability } from "@/components/rides/ride-directory";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return rides.map((ride) => ({ slug: ride.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ride = rides.find((entry) => entry.slug === slug);
  if (!ride) return { title: "Ride not found", robots: { index: false } };
  return {
    title: ride.title,
    description: ride.description,
    alternates: { canonical: siteOrigin + "/rides/" + ride.slug },
    robots: {
      index: !isPreviewDeployment && ride.status !== "cancelled",
      follow: true,
    },
    openGraph: {
      title: ride.title,
      description: ride.description,
      url: siteOrigin + "/rides/" + ride.slug,
      type: "website",
    },
  };
}

export default async function RidePage({ params }: Props) {
  const { slug } = await params;
  const ride = rides.find((entry) => entry.slug === slug);
  if (!ride) notFound();
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 py-12 sm:py-20">
      <Link href="/rides" className="underline underline-offset-4">
        All community rides
      </Link>
      <h1 className="text-3xl font-bold sm:text-4xl">{ride.title}</h1>
      <RideAvailability ride={ride} />
      <p className="leading-relaxed">{ride.description}</p>
      <dl className="space-y-4">
        {[
          ["Starts", formatRideDate(ride.startsAt)],
          ["Ends", formatRideDate(ride.endsAt)],
          ["Meeting point", ride.meetingPoint],
          ["Destination", ride.destination],
          ["Distance", ride.distanceKm + " km"],
          ["Organizer", ride.organizer],
          ["Experience and pace", ride.experience],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="font-semibold">{label}</dt>
            <dd className="mt-1 text-muted-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-3">
        <Button asChild className="min-h-11">
          <a href={ride.redditUrl}>Check updates on Reddit</a>
        </Button>
        {ride.directionsUrl && ride.status !== "cancelled" && (
          <Button asChild variant="outline" className="min-h-11">
            <a href={ride.directionsUrl}>Open organizer directions</a>
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Listing updated {formatRideDate(ride.updatedAt)}. This page does not
        reserve a place; discuss participation with the organizer.
      </p>
    </main>
  );
}
