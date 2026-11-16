import { CommunityPage } from "@/components/common/community-page";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <CommunityPage
      title="Motorcycle maintenance"
      description="Maintenance discussions for every motorcycle brand. Reviewed guides are not published here yet; use your motorcycle's owner manual for model-specific schedules and instructions."
      actionLabel="Discuss maintenance on Reddit"
    >
      <nav
        aria-label="Maintenance resources"
        className="flex flex-col items-start gap-4"
      >
        <Link
          href="/maintenance/garages"
          className="underline underline-offset-4"
        >
          Garage recommendations
        </Link>
        <Link href="/maintenance/sos" className="underline underline-offset-4">
          Roadside help information
        </Link>
      </nav>
    </CommunityPage>
  );
}
