import { CommunityPage } from "@/components/common/community-page";
import { RideDirectory } from "@/components/rides/ride-directory";
import { getRides } from "@/lib/content-source";
import { createPageMetadata } from "@/lib/siteMetadata";

export const revalidate = 60;

export async function generateMetadata() {
  const rides = await getRides();
  return createPageMetadata("/rides", { index: rides.length > 0 });
}

export default async function RidesPage() {
  const rides = await getRides();
  return (
    <CommunityPage
      title="Community rides"
      description="Explore community ride plans. Confirm the meeting point, route, pace, and latest updates with the organizer in the original Reddit discussion."
      actionLabel="Visit ride discussions on Reddit"
    >
      <RideDirectory rides={rides} />
    </CommunityPage>
  );
}
