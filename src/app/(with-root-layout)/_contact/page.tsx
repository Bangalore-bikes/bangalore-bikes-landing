import { CommunityPage } from "@/components/common/community-page";
import { communityLinks } from "@/lib/community";

export default function ContactPage() {
  return (
    <CommunityPage
      title="Contact the moderators"
      description="For community questions, website corrections, or resource suggestions, send a message to the r/BangaloreBikes moderators on Reddit."
      actionLabel="Open Reddit modmail"
      actionUrl={communityLinks.modmail}
    >
      <p>
        The link opens Reddit, where you can write and send your message. Reddit
        may ask you to sign in. This website does not collect or send contact
        messages.
      </p>
      <p>
        Moderators are community volunteers. Modmail is not an emergency or
        roadside-assistance service.
      </p>
    </CommunityPage>
  );
}
