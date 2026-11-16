import { z } from "zod";

const text = z.string().trim().min(1).max(2000);
const timestamp = z
  .string()
  .datetime({ offset: true })
  .refine(
    (value) => Number.isFinite(Date.parse(value)),
    "Use a valid ISO timestamp",
  );
function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}
const httpsUrl = z
  .string()
  .url()
  .refine((value) => {
    const url = parseUrl(value);
    return (
      url?.protocol === "https:" &&
      !url.username &&
      !url.password &&
      [...value].every(
        (char) => char.charCodeAt(0) > 32 && char.charCodeAt(0) !== 127,
      )
    );
  }, "Use an HTTPS URL without credentials");

export const rideSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: text.max(200),
    description: text,
    startsAt: timestamp,
    endsAt: timestamp,
    meetingPoint: text,
    destination: text,
    distanceKm: z.number().positive().finite(),
    organizer: text.max(200),
    experience: text,
    redditUrl: httpsUrl.refine((value) => {
      const url = parseUrl(value);
      return (
        url !== undefined &&
        ["reddit.com", "www.reddit.com"].includes(url.hostname) &&
        /^\/r\/bangalorebikes\/comments\/[a-z0-9]+(?:\/|$)/i.test(url.pathname)
      );
    }, "Link to the original r/BangaloreBikes discussion"),
    directionsUrl: httpsUrl.optional(),
    updatedAt: timestamp,
    confirmed: z.literal(true),
    status: z.enum(["scheduled", "cancelled"]),
    cancellationReason: text.optional(),
  })
  .superRefine((ride, ctx) => {
    if (Date.parse(ride.endsAt) <= Date.parse(ride.startsAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "End must follow start",
      });
    }
    if (ride.status === "cancelled" && !ride.cancellationReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cancellationReason"],
        message: "Explain the cancellation",
      });
    }
  });

export type Ride = z.infer<typeof rideSchema>;

export function parseRides(input: unknown): Ride[] {
  const rides = z.array(rideSchema).parse(input);
  if (new Set(rides.map((ride) => ride.slug)).size !== rides.length) {
    throw new Error("Ride slugs must be unique");
  }
  return rides;
}
