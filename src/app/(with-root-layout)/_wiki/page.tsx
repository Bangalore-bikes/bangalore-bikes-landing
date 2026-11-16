import { CommunityPage } from "@/components/common/community-page";
import { communityLinks } from "@/lib/community";

export default function WikiPage() {
  return (
    <CommunityPage
      title="Community resources"
      description="The website's resource directory is not published yet. Source-linked guides on destinations, maintenance, riding etiquette, and motorcycle transport will be added as they are reviewed."
      actionLabel="Suggest a resource via modmail"
      actionUrl={communityLinks.modmail}
    />
  );
}
