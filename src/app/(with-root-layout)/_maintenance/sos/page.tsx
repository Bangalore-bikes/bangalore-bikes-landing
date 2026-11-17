import { CommunityPage } from "@/components/common/community-page";
import Link from "next/link";

export default function SOSPage() {
  return (
    <CommunityPage
      title="Roadside help"
      description="Bangalore Bikes does not operate an emergency hotline, towing service, or roadside-assistance service."
      actionLabel="Read the emergency guide"
      actionUrl={"/wiki/emergency-contacts"}
    >
      <p>
        In an emergency, call{" "}
        <a
          href="tel:112"
          className="font-semibold underline underline-offset-4"
        >
          112
        </a>{" "}
        for emergency services. Do not wait for a response on Reddit or modmail.
      </p>
      <p>
        For a breakdown, use the assistance contact in the official documents
        from your insurer or motorcycle manufacturer. Confirm coverage, charges,
        and availability with the provider.
      </p>
      <p>
        <Link
          href="/wiki/emergency-contacts"
          className="underline underline-offset-4"
        >
          Read who to contact and how the ride group can coordinate.
        </Link>{" "}
        The guide links to the Ministry of Home Affairs emergency-number
        information and the community’s published SOP.
      </p>
    </CommunityPage>
  );
}
