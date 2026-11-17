import { CommunityPage } from "@/components/common/community-page";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <CommunityPage
      title="Motorcycle maintenance"
      description="Make your next workshop visit easier. Read an attributed rider experience, prepare your questions, and know where to find help if a ride goes wrong. For model-specific service schedules, use your motorcycle's owner manual."
      actionLabel="Read workshop experiences"
      actionUrl="/maintenance/garages"
    >
      <nav
        aria-label="Maintenance resources"
        className="flex flex-col items-start gap-4"
      >
        <Link
          href="/maintenance/garages"
          className="underline underline-offset-4"
        >
          Workshop experiences
        </Link>
        <Link href="/maintenance/sos" className="underline underline-offset-4">
          Roadside help information
        </Link>
      </nav>
      <section aria-labelledby="workshop-preparation-title">
        <h2 id="workshop-preparation-title" className="text-2xl font-semibold">
          Before booking a service
        </h2>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>
            Describe the symptoms, when they happen, and any recent work on the
            bike.
          </li>
          <li>
            Ask the workshop to confirm the planned work, estimate and approval
            process before replacing parts.
          </li>
          <li>
            Check opening times and whether the workshop handles your motorcycle
            model directly with the business.
          </li>
          <li>Keep the invoice and a record of the work carried out.</li>
        </ul>
      </section>
      <p>
        <Link href="/wiki/ride-rules" className="underline underline-offset-4">
          Read the group-ride preparation guide
        </Link>{" "}
        before joining a community ride.
      </p>
    </CommunityPage>
  );
}
