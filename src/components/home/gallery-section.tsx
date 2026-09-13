import { ArrowLink, Container } from "@/components/common/section";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { SHOTS } from "@/data/gallery";

const STRIP_SHOTS = SHOTS.slice(0, 6);

export function GallerySection() {
  return (
    <section className="border-y border-line bg-bg2">
      <Container className="py-24">
        <div
          data-reveal=""
          className="mb-11 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-3.5 text-[13px] font-semibold tracking-[0.18em] text-acc uppercase">
              Shot by members
            </div>
            <h2 className="font-display m-0 text-[clamp(30px,4.5vw,56px)] leading-none font-bold tracking-[-0.03em] uppercase">
              The gallery
            </h2>
          </div>
          <ArrowLink href="/gallery">See all photos</ArrowLink>
        </div>

        <GalleryGrid shots={STRIP_SHOTS} variant="strip" />
      </Container>
    </section>
  );
}
