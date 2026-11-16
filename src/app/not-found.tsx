import { CommunityPage } from "@/components/common/community-page";

export default function NotFound() {
  return (
    <CommunityPage
      title="Page not found"
      description="This page may have moved, or the link may be incorrect. Return to the community homepage to find resources and Reddit discussions."
      actionLabel="Back to the homepage"
      actionUrl="/"
    />
  );
}
