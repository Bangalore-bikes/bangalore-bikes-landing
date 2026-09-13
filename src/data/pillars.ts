export type Pillar = {
  readonly num: string;
  readonly title: string;
  readonly desc: string;
  readonly href: string;
};

export const PILLARS: readonly Pillar[] = [
  {
    num: "01",
    title: "Rides & routes",
    desc: "Curated destinations from sunrise loops to weekenders, with distance and difficulty.",
    href: "/rides",
  },
  {
    num: "02",
    title: "Wiki & rules",
    desc: "Subreddit etiquette, ride rules, WhatsApp code of conduct. Read once, ride forever.",
    href: "/wiki",
  },
  {
    num: "03",
    title: "SOS",
    desc: "Emergency numbers, towing, blood banks and how to ask the community for help.",
    href: "/sos",
  },
  {
    num: "04",
    title: "Community",
    desc: "Free, independent, non-profit. Reddit for talk, WhatsApp for planning. No selling, ever.",
    href: "/about",
  },
] as const;
