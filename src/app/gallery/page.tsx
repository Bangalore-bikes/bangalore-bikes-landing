import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/common/section";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { SHOTS } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Ride pictures shot by members of r/bangalorebikes: night rides, ghats, machines and the lineups in between.",
};

export default function GalleryPage() {
  return (
    <Container className="pt-20 pb-25">
      <PageHeader eyebrow="Photos · shot by members">
        Ride
        <br />
        pictures.
      </PageHeader>

      <p className="mt-8 mb-10 max-w-[380px] text-[15px] leading-relaxed text-fg2 md:ml-auto">
        Got a good one from a ride? Post it on Reddit or drop it in the WhatsApp
        group and we&apos;ll add it here.
      </p>

      <GalleryGrid shots={SHOTS} variant="page" />
    </Container>
  );
}
