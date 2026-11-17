import Image from "next/image";
import { CommunityPosts } from "@/components/home/CommunityPosts";
import { UpcomingRides } from "@/components/home/UpcomingRides";
import { LatestArticles } from "@/components/home/LatestArticles";
import { WikiHighlights } from "@/components/home/WikiHighlights";
import Link from "next/link";
import { WhatsAppJoin } from "@/components/common/whatsapp-join";

export const revalidate = 60;

const Hero = () => {
  return (
    <div className="w-full flex justify-center mt-4 lg:mt-16">
      <div className="w-full relative h-96 lg:h-[500px]">
        <Image
          src="/hero-banner.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 75vw, 100vw"
          className="object-cover overflow-hidden rounded-lg"
        />
        <div className="absolute inset-0 bg-black/60 rounded-lg"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10 px-4">
          <h1 className="text-2xl lg:text-6xl font-bold mb-4 tracking-tight">
            Welcome to <span className="text-dixie">Bangalore</span> Bikes
          </h1>
          <p className="text-lg lg:text-xl text-white/90 max-w-xl leading-relaxed">
            Your hub for motorcycle enthusiasts in namma Bengaluru. Explore
            rides, learn about maintenance, and connect with fellow riders.
          </p>
          <Link
            href="/wiki"
            className="mt-7 inline-flex min-h-12 items-center rounded-md bg-dixie px-6 py-3 font-semibold text-black hover:underline hover:underline-offset-4"
          >
            Explore the community handbook
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <main className="flex flex-col gap-8 w-full self-center px-2 lg:px-8">
      <Hero />
      <CommunityPosts />
      <WikiHighlights />
      <UpcomingRides />
      <LatestArticles />
      <WhatsAppJoin />
    </main>
  );
}
import { createPageMetadata } from "@/lib/siteMetadata";

export const metadata = createPageMetadata("/");
