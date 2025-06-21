import { RedditIcon } from "../icons/reddit";

export const Footer = () => {
  return (
    <div className="w-full lg:max-w-9/12 mx-auto flex flex-col gap-2 items-center mb-4 mt-4">
      <div className="flex gap-2">
        <a href="https://reddit.com/r/BangaloreBikes" target="_blank">
          <RedditIcon />
        </a>
      </div>
      <span className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Bangalore Bikes. All rights reserved.
      </span>
    </div>
  );
};
