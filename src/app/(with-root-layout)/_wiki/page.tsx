import { CommunityPage } from "@/components/common/community-page";
import { communityLinks } from "@/lib/community";
import { ResourceDirectory } from "@/components/common/resource-directory";
import { communityResources } from "@/data/community-resources";

export default function WikiPage() {
  return (
    <CommunityPage
      title="Community resources"
      description="A starting collection of community notices and member experiences from r/BangaloreBikes. These links are not a live feed, verified service directory, or a list of moderator-approved recommendations."
      actionLabel="Suggest a resource via modmail"
      actionUrl={communityLinks.modmail}
    >
      <section aria-labelledby="reddit-resources-title">
        <h2 id="reddit-resources-title" className="mb-6 text-2xl font-semibold">
          Read the original discussions
        </h2>
        <ResourceDirectory entries={communityResources} />
      </section>
    </CommunityPage>
  );
}
