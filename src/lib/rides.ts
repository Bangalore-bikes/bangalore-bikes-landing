import type { Ride } from "./rideSchema";

export function rideState(ride: Ride, now: Date) {
  if (ride.status === "cancelled") return "cancelled";
  if (now.getTime() >= Date.parse(ride.endsAt)) return "past";
  if (now.getTime() >= Date.parse(ride.startsAt)) return "in-progress";
  return "upcoming";
}

export function formatRideDate(timestamp: string) {
  return (
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    }).format(new Date(timestamp)) + " IST"
  );
}

function calendarText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function calendarDate(value: string) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

// Fold on UTF-8 code-point boundaries; continuation spaces count toward 75 octets.
function foldLine(value: string) {
  const encoder = new TextEncoder();
  let line = "";
  let bytes = 0;
  const lines: string[] = [];
  for (const char of value) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) {
      lines.push(line);
      line = " ";
      bytes = 1;
    }
    line += char;
    bytes += size;
  }
  lines.push(line);
  return lines.join("\r\n");
}

export function createRideCalendar(ride: Ride) {
  if (ride.status === "cancelled")
    throw new Error("Cancelled rides cannot be added to a calendar");
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Bangalore Bikes//Community Rides//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + ride.slug + "@bangalorebikes.com",
      "DTSTAMP:" + calendarDate(ride.updatedAt),
      "DTSTART:" + calendarDate(ride.startsAt),
      "DTEND:" + calendarDate(ride.endsAt),
      "SUMMARY:" + calendarText(ride.title),
      "LOCATION:" + calendarText(ride.meetingPoint),
      "DESCRIPTION:" +
        calendarText(
          ride.description +
            "\nOrganizer: " +
            ride.organizer +
            "\nCheck the Reddit thread for changes: " +
            ride.redditUrl,
        ),
      "URL:" + ride.redditUrl,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .map(foldLine)
      .join("\r\n") + "\r\n"
  );
}

export function createRideCalendarResponse(
  rides: readonly Ride[],
  slug: string,
  now: Date,
) {
  const ride = rides.find((entry) => entry.slug === slug);
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (!ride) return new Response("Ride not found", { status: 404, headers });
  if (rideState(ride, now) !== "upcoming") {
    return new Response(
      "Calendar download is available only for upcoming, non-cancelled rides.",
      { status: 410, headers },
    );
  }
  return new Response(createRideCalendar(ride), {
    headers: {
      ...headers,
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="' + ride.slug + '.ics"',
    },
  });
}
