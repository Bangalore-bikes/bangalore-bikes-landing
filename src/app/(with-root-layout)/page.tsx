import { CommunityPosts } from "@/components/home/CommunityPosts";
import { UpcomingRides } from "@/components/home/UpcomingRides";
import { LatestArticles } from "@/components/home/LatestArticles";
import { WikiHighlights } from "@/components/home/WikiHighlights";
import { HomeHero } from "@/components/home/HomeHero";
import { QuickActions } from "@/components/home/QuickActions";
import { RidePicker, type PickerDestination } from "@/components/home/RidePicker";
import { Reveal } from "@/components/motion/reveal";
import { WhatsAppJoin } from "@/components/common/whatsapp-join";
import { destinationArchive, wikiGuides } from "@/data/wiki";
import { destinationSlugIndex } from "@/lib/destinations";
import { createPageMetadata } from "@/lib/siteMetadata";

export const revalidate = 60;
export const metadata = createPageMetadata("/");

const slugs = destinationSlugIndex(destinationArchive.rows);
const pickerItems: PickerDestination[] = destinationArchive.rows.flatMap((row) =>
  row.distanceKm === null
    ? []
    : [
        {
          name: row.name,
          slug: slugs[row.id],
          km: row.distanceKm,
          kind: row.kind,
          from: row.cells[15]?.trim() ?? "",
          to: row.cells[16]?.trim() ?? "",
        },
      ],
);

export default function Home() {
  return (
    <main className="flex w-full flex-col gap-14 self-center px-2 pb-8 lg:px-8">
      <noscript>
        <style>{".reveal{opacity:1!important;transform:none!important}.hero-rise{opacity:1!important}"}</style>
      </noscript>
      <HomeHero
        stats={[
          { label: "Destinations", value: pickerItems.length },
          { label: "Guides", value: wikiGuides.length },
        ]}
      />
      <QuickActions />

      <Reveal as="section" className="scroll-mt-24" >
        <div id="plan" className="scroll-mt-24">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Where to ride</h2>
          <p className="mb-6 mt-3 max-w-prose text-muted-foreground">
            Set how far you want to go and when. We filter the community&apos;s destination
            record for you.
          </p>
          <RidePicker items={pickerItems} />
        </div>
      </Reveal>

      <Reveal><CommunityPosts /></Reveal>
      <Reveal><WikiHighlights /></Reveal>
      <Reveal><UpcomingRides /></Reveal>
      <Reveal><LatestArticles /></Reveal>
      <Reveal><WhatsAppJoin /></Reveal>
    </main>
  );
}
