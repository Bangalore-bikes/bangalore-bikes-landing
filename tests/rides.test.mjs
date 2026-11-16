import assert from "node:assert/strict";
import test from "node:test";
import {
  rideState,
  createRideCalendar,
  createRideCalendarResponse,
} from "../src/lib/rides.ts";
import { rideSchema, parseRides } from "../src/lib/rideSchema.ts";

const ride = {
  slug: "test-breakfast-ride",
  title: "Test ride, not a published event",
  description: "A fixture used only in automated tests.",
  startsAt: "2030-01-20T06:00:00+05:30",
  endsAt: "2030-01-20T10:00:00+05:30",
  meetingPoint: "Test meeting point",
  destination: "Test destination",
  distanceKm: 40,
  organizer: "Test organizer",
  experience: "Discuss pace with the organizer",
  redditUrl: "https://www.reddit.com/r/bangalorebikes/comments/test/test_ride/",
  updatedAt: "2030-01-01T00:00:00Z",
  confirmed: true,
  status: "scheduled",
};

test("download responses allow only upcoming rides and prevent caching", async () => {
  const now = new Date("2030-01-19T00:00:00Z");
  const response = createRideCalendarResponse([ride], ride.slug, now);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(
    response.headers.get("content-type"),
    "text/calendar; charset=utf-8",
  );
  assert.equal(
    response.headers.get("content-disposition"),
    'attachment; filename="test-breakfast-ride.ics"',
  );
  assert.ok((await response.text()).includes("BEGIN:VEVENT"));
  assert.equal(createRideCalendarResponse([], "missing", now).status, 404);
  assert.equal(
    createRideCalendarResponse([ride], ride.slug, new Date(ride.endsAt)).status,
    410,
  );
  assert.equal(
    createRideCalendarResponse([ride], ride.slug, new Date(ride.startsAt))
      .status,
    410,
  );
  const cancelled = {
    ...ride,
    status: "cancelled",
    cancellationReason: "Weather",
  };
  assert.equal(
    createRideCalendarResponse([cancelled], ride.slug, now).status,
    410,
  );
});

test("only confirmed rides with valid local timestamps and source URLs are accepted", () => {
  assert.equal(rideSchema.safeParse(ride).success, true);
  for (const patch of [
    { confirmed: false },
    { startsAt: "2030-01-20T06:00:00" },
    {
      redditUrl: "https://www.reddit.com.evil.test/r/bangalorebikes/comments/x",
    },
    { redditUrl: "https://www.reddit.com/r/anothercommunity/comments/x" },
    { directionsUrl: "javascript:alert(1)" },
    { endsAt: ride.startsAt },
    { distanceKm: -1 },
    { slug: "../escape" },
  ])
    assert.equal(
      rideSchema.safeParse({ ...ride, ...patch }).success,
      false,
      JSON.stringify(patch),
    );
});

test("duplicate ride slugs and missing cancellation reasons fail validation", () => {
  assert.throws(() => parseRides([ride, ride]));
  assert.equal(
    rideSchema.safeParse({ ...ride, status: "cancelled" }).success,
    false,
  );
});

test("invalid timezone offsets cannot enter a ride record", () => {
  assert.equal(
    rideSchema.safeParse({ ...ride, startsAt: "2030-01-20T06:00:00+99:99" })
      .success,
    false,
  );
});

test("malformed source and directions links return validation errors rather than throwing", () => {
  assert.equal(
    rideSchema.safeParse({ ...ride, redditUrl: "not a url" }).success,
    false,
  );
  assert.equal(
    rideSchema.safeParse({ ...ride, directionsUrl: "not a url" }).success,
    false,
  );
  assert.equal(
    rideSchema.safeParse({
      ...ride,
      redditUrl: ride.redditUrl + "\r\nSTATUS:CANCELLED",
    }).success,
    false,
  );
});

test("state transitions use exact UTC boundaries and cancellation takes precedence", () => {
  assert.equal(rideState(ride, new Date("2030-01-20T00:29:59Z")), "upcoming");
  assert.equal(
    rideState(ride, new Date("2030-01-20T00:30:00Z")),
    "in-progress",
  );
  assert.equal(rideState(ride, new Date("2030-01-20T04:30:00Z")), "past");
  assert.equal(
    rideState({ ...ride, status: "cancelled" }, new Date("2040-01-01Z")),
    "cancelled",
  );
});

test("calendar encodes Indian timestamps as UTC and escapes text", () => {
  const calendar = createRideCalendar({
    ...ride,
    title: "A, B; C\\D",
    meetingPoint: "First\nSecond",
  });
  assert.ok(calendar.includes("DTSTART:20300120T003000Z\r\n"));
  assert.ok(calendar.includes("DTEND:20300120T043000Z\r\n"));
  assert.ok(calendar.includes("SUMMARY:A\\, B\\; C\\\\D"));
  assert.ok(calendar.includes("LOCATION:First\\nSecond"));
  assert.ok(calendar.endsWith("END:VCALENDAR\r\n"));
  assert.ok(!calendar.replaceAll("\r\n", "").includes("\n"));
});

test("calendar folds UTF-8 safely and refuses cancelled events", () => {
  const calendar = createRideCalendar({
    ...ride,
    title: "Ride ".repeat(30) + "ಬೆಂಗಳೂರು".repeat(10),
  });
  for (const line of calendar.split("\r\n"))
    assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  assert.ok(!calendar.includes("\uFFFD"));
  assert.throws(() =>
    createRideCalendar({
      ...ride,
      status: "cancelled",
      cancellationReason: "Weather",
    }),
  );
});
