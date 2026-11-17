import { getRides } from "@/lib/content-source";
import { createRideCalendarResponse } from "@/lib/rides";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const rides = await getRides();
  return createRideCalendarResponse(rides, slug, new Date());
}
