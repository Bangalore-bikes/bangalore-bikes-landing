import { CommunityPage } from "@/components/common/community-page";

export default function SOSPage() {
  return (
    <CommunityPage
      title="Roadside help"
      description="Bangalore Bikes does not operate an emergency hotline, towing service, or roadside-assistance service."
      actionLabel="Return to maintenance resources"
      actionUrl={"/maintenance"}
    >
      <p>
        If you are in immediate danger, contact local emergency services
        directly. Do not wait for a response on Reddit or modmail.
      </p>
      <p>
        For a breakdown, use the assistance contact in the official documents
        from your insurer or motorcycle manufacturer. Confirm coverage, charges,
        and availability with the provider.
      </p>
      <p>No reviewed assistance contacts are published here yet.</p>
    </CommunityPage>
  );
}
