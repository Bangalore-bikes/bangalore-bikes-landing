import { rides } from "@/data/rides";
import { createRideCalendarResponse } from "@/lib/rides";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  return createRideCalendarResponse(rides, slug, new Date());
}
