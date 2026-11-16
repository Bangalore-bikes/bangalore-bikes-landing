import { CommunityPage } from "@/components/common/community-page";
import { rides } from "@/data/rides";
import { RideDirectory } from "@/components/rides/ride-directory";

export default function RidesPage() {
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
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("/rides", {
  index: rides.length > 0,
});
