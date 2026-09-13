import type { Metadata } from "next";
import Image from "next/image";

import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/common/section";
import { photoUrl } from "@/data/media";
import { LINKS } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Two random bikers met on r/Indiabikes, rode one night, and r/bangalorebikes grew out of it.",
};

const ABOUT_PHOTO = photoUrl(5206863, 1200);

export default function AboutPage() {
  return (
    <>
      <Container className="pt-20 pb-10">
        <PageHeader eyebrow="About us">
          Two random
          <br />
          bikers.
        </PageHeader>
      </Container>

      <Container className="pb-25">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2">
          <div className="animate-float relative aspect-4/5 overflow-hidden rounded-3xl border border-line">
            <Image
              src={ABOUT_PHOTO}
              alt="Rider geared up beside a motorcycle"
              fill
              sizes="(max-width: 860px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div
            data-reveal=""
            className="flex flex-col gap-5.5 text-[clamp(17px,1.5vw,20px)] leading-relaxed"
          >
            <p className="m-0">
              Welcome to the r/bangalorebikes Wiki. This wiki serves as a hub
              for bikers in and around Bangalore. Whether you&apos;re a seasoned
              rider or just starting out, you&apos;ll find a wealth of
              information here to enhance your biking experience.
            </p>
            <p className="m-0">
              We were two random bikers who met initially on the r/Indiabikes
              forum. Both the mods agreed on a night that they were free to meet
              and ride. We rode and realised that more such people could come
              and hangout, and go on short rides during the night.
            </p>
            <p className="m-0">
              That&apos;s how we slowly got introduced to many many like-minded
              and incredible people along the way. We have an awesome group of
              mods as well, who are always active on both forums for any help.
            </p>
            <p className="m-0">
              Our sub is open to everyone who wants to ride and share their own
              stories, and experiences.
            </p>
            <p className="font-display m-0 font-bold text-acc">
              We are here to make many good memories, and friends along the way!
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={LINKS.reddit}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-13 items-center rounded-full bg-fg px-6 text-[15px] font-bold text-bg transition-colors hover:bg-acc hover:text-acc-fg"
              >
                r/bangalorebikes ↗
              </a>
              <a
                href={LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-13 items-center rounded-full border border-line px-6 text-[15px] font-bold transition-colors hover:border-acc"
              >
                Contribute on GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
