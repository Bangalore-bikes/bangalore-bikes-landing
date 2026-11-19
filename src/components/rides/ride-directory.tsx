"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Ride } from "@/lib/rideSchema";
import { formatRideDate, rideState } from "@/lib/rides";
import { Button } from "@/components/ui/button";

function useRideClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);
  return now;
}

export function RideAvailability({ ride }: { ride: Ride }) {
  const now = useRideClock();
  const state = now
    ? rideState(ride, now)
    : ride.status === "cancelled"
      ? "cancelled"
      : null;
  return (
    <div className="space-y-4">
      <p role="status" className="font-medium">
        {state === "upcoming"
          ? "Upcoming ride"
          : state === "in-progress"
            ? "Ride in progress"
            : state === "past"
              ? "Past ride"
              : state === "cancelled"
                ? "Ride cancelled"
                : "Checking ride schedule…"}
      </p>
      {state === "cancelled" && (
        <p>Cancellation reason: {ride.cancellationReason}</p>
      )}
      {state === "upcoming" && (
        <>
          <Button asChild variant="outline" className="min-h-11">
            <a href={"/rides/" + ride.slug + "/calendar"} download>
              Add to calendar (.ics)
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">
            This downloads a snapshot, not a live calendar subscription. Check
            the Reddit thread for changes or cancellation.
          </p>
        </>
      )}
    </div>
  );
}

export function RideDirectory({
  rides,
  upcomingOnly = false,
}: {
  rides: readonly Ride[];
  upcomingOnly?: boolean;
}) {
  const now = useRideClock();
  if (rides.length === 0) {
    return (
      <p className="text-muted-foreground">
        No confirmed rides are listed on the website yet. Check the subreddit
        and confirm plans with the organizer before setting off.
      </p>
    );
  }
  if (!now) return <p role="status">Checking ride schedule…</p>;
  const groups = [
    { state: "upcoming", label: "Upcoming rides" },
    { state: "in-progress", label: "Rides in progress" },
    { state: "cancelled", label: "Cancelled rides" },
    { state: "past", label: "Past rides" },
  ] as const;
  const visibleGroups = upcomingOnly ? groups.slice(0, 1) : groups;
  return (
    <div className="space-y-10">
      {visibleGroups.map((group) => {
        const matches = rides
          .filter((ride) => rideState(ride, now) === group.state)
          .sort((a, b) =>
            group.state === "past"
              ? Date.parse(b.startsAt) - Date.parse(a.startsAt)
              : Date.parse(a.startsAt) - Date.parse(b.startsAt),
          );
        if (!matches.length)
          return upcomingOnly ? (
            <p key={group.state} className="text-muted-foreground">
              No upcoming rides are currently listed. Check the rides page for
              past and cancelled events.
            </p>
          ) : null;
        return (
          <section key={group.state} aria-label={group.label}>
            {!upcomingOnly && (
              <h2 className="mb-4 text-2xl font-semibold">{group.label}</h2>
            )}
            <ul className="grid gap-4 md:grid-cols-2">
              {matches.map((ride) => {
                const start = new Date(ride.startsAt);
                const day = new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  timeZone: "Asia/Kolkata",
                }).format(start);
                const month = new Intl.DateTimeFormat("en-IN", {
                  month: "short",
                  timeZone: "Asia/Kolkata",
                }).format(start);
                return (
                  <li key={ride.slug}>
                    <Link
                      href={"/rides/" + ride.slug}
                      className="lift group flex h-full gap-4 rounded-xl border border-border bg-card p-5"
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-16 shrink-0 flex-col items-center justify-center rounded-lg bg-dixie text-black"
                      >
                        <span className="text-2xl font-bold leading-none">{day}</span>
                        <span className="mt-1 text-xs font-medium uppercase">{month}</span>
                      </span>
                      <span className="min-w-0 space-y-1">
                        <span className="block text-lg font-semibold leading-snug underline-offset-4 group-hover:underline">
                          {ride.title}
                        </span>
                        <span className="block text-sm">{formatRideDate(ride.startsAt)}</span>
                        <span className="block text-sm text-muted-foreground">
                          {ride.meetingPoint} to {ride.destination} · {ride.distanceKm} km
                        </span>
                        {ride.status === "cancelled" && (
                          <span className="block text-sm">
                            Cancelled: {ride.cancellationReason}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
