export const SITE = {
  name: "Bangalore Bikes",
  subreddit: "r/bangalorebikes",
  url: "https://bangalorebikes.com",
  tagline:
    "A hub for bikers in and around Bangalore. Weekend routes, night rides, ride rules and a community that shows up when you're stranded. Free, independent, non-profit.",
  since: 2024,
} as const;

export const LINKS = {
  reddit: "https://www.reddit.com/r/bangalorebikes/",
  whatsapp: "https://tinyurl.com/bangalorebikeswa",
  github: "https://github.com/Bangalore-bikes/bangalore-bikes-landing",
} as const;

export type NavItem = { label: string; href: string };

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Rides", href: "/rides" },
  { label: "Gallery", href: "/gallery" },
  { label: "Wiki", href: "/wiki" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;
