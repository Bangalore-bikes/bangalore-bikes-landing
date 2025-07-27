import { Link } from "next-view-transitions";
import { RedditIcon, } from "../icons/reddit";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <div className="w-full lg:max-w-9/12 mx-auto flex flex-col gap-2 items-center mb-4 mt-4">
      <div className="flex gap-2">
        <Link href="https://reddit.com/r/BangaloreBikes" target="_blank">
          <RedditIcon />
        </Link>
        <a
                href="#"
                className="text-gray-300 hover:text-[var(--bb-gold)] transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-[var(--bb-gold)] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-[var(--bb-gold)] transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-[var(--bb-gold)] transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
      </div>
      <span className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Bangalore Bikes. All rights reserved.
      </span>
    </div>
  );
};
