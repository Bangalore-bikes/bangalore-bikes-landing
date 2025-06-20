import { RedditIcon } from "@/components/icons/reddit";

const ParkingPage = () => {
  return (
    <div className="flex flex-col min-h-svh justify-center items-center gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold">Welcome to Bangalore Bikes</h1>
        <p className="text-lg text-muted-foreground">
          We are currently under construction 🚧
        </p>
      </div>
      <div className="z-10 w-full max-w-xl px-5 xl:px-0">
        <div className="flex flex-col sm:flex-row flex-nowrap items-center justify-center space-x-1 text-xs whitespace-nowrap">
          <span>In the meantime, you can view our community at</span>
          <a
            href="https://reddit.com/r/BangaloreBikes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 hover:underline"
          >
            <RedditIcon />
            <span>r/BangaloreBikes</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <main className="px-4 @sm:px-6">
      <ParkingPage />
    </main>
  );
}
