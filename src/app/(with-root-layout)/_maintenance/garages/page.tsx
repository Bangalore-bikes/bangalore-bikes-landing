import { CommunityPage } from "@/components/common/community-page";
import Link from "next/link";
import { communityResources } from "@/data/community-resources";

const report = communityResources.find(
  (resource) => resource.id === "workshop-experience",
);

export default function GaragesPage() {
  return (
    <CommunityPage
      title="Workshop experiences"
      description="Start with an attributed community report, not a fabricated rating. Confirm the workshop's current services, location, prices and availability directly before visiting."
      actionLabel="Back to maintenance"
      actionUrl="/maintenance"
    >
      {report && (
        <article className="border-y border-border py-7">
          <h2 className="text-2xl font-semibold">PFB Customs</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Member report by u/AkhiHasItAll · source checked 17 November 2026
          </p>
          <p className="mt-5 leading-relaxed">
            The rider described trying a workshop suggested by another community
            member and reported improvements after servicing, including engine
            smoothness, panel noise and ABS operation. The author named PFB
            Customs in their location comment.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            This is one member’s experience, not an independent inspection,
            price quote or endorsement by Bangalore Bikes. No star rating,
            opening hours or current availability is claimed.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <a
              href="https://maps.app.goo.gl/9KhxXEpBxS2HJLfK8?g_st=ic"
              className="inline-flex min-h-11 items-center underline underline-offset-4"
            >
              Map linked by the author
            </a>
            <a
              href={report.url}
              className="inline-flex min-h-11 items-center underline underline-offset-4"
            >
              Original report & comments
            </a>
          </div>
        </article>
      )}
      <section aria-labelledby="compare-workshops-title">
        <h2 id="compare-workshops-title" className="text-2xl font-semibold">
          Questions worth asking
        </h2>
        <ul className="mt-4 list-disc space-y-3 pl-5">
          <li>
            Do you service this motorcycle model and diagnose the issue I am
            describing?
          </li>
          <li>
            What work is included in the estimate, and will you ask before
            adding to it?
          </li>
          <li>
            Which parts will be used, and what does the invoice or warranty
            cover?
          </li>
        </ul>
      </section>
      <p>
        <Link
          href="/wiki/emergency-contacts"
          className="underline underline-offset-4"
        >
          Need help during a ride?
        </Link>{" "}
        Read emergency and roadside-help information before setting off.
      </p>
    </CommunityPage>
  );
}
