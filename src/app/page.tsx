import { BlogSection } from "@/components/home/blog-section";
import { GallerySection } from "@/components/home/gallery-section";
import { HeroSection } from "@/components/home/hero-section";
import { JoinSection } from "@/components/home/join-section";
import { NextRidesSection } from "@/components/home/next-rides-section";
import { PillarsSection } from "@/components/home/pillars-section";
import { SosBand } from "@/components/home/sos-band";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PillarsSection />
      <NextRidesSection />
      <SosBand />
      <BlogSection />
      <GallerySection />
      <JoinSection />
    </>
  );
}
