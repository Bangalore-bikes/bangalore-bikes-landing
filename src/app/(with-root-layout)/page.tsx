import Image from "next/image";
import { LatestFromBlog } from "@/components/home/LatestFromBlog";
import { UpcomingRides } from "@/components/home/UpcomingRides";

const Hero = () => {
  return (
    <div className="w-full flex justify-center mt-4 lg:mt-16">
      <div className="w-full relative h-96 lg:h-[500px]">
        <Image
          src="/hero-banner.png"
          alt="Hero"
          fill
          className="object-cover w-auto h-full overflow-hidden rounded-lg"
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
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="flex flex-col gap-8 w-full lg:w-3/4 self-center  px-2 lg:px-8">
      <Hero />
      <UpcomingRides />
      <LatestFromBlog />
    </div>
  );
}
