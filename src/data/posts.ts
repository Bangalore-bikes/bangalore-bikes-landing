import { photoUrl } from "./media";

export type Post = {
  readonly id: string;
  readonly tag: string;
  readonly read: string;
  readonly title: string;
  readonly excerpt: string;
  readonly by: string;
  readonly date: string;
  readonly src: string;
  readonly alt: string;
};

export const POSTS: readonly Post[] = [
  {
    id: "nandi-5am",
    tag: "Guide",
    read: "8 min",
    title: "Nandi Hills at 5 AM: the only way to do it",
    excerpt:
      "Route, fuel, where the cops sit, and why you leave before the sun does.",
    by: "u/nightrider_blr",
    date: "Aug 2026",
    src: photoUrl(14067426, 1200),
    alt: "Motorbikes parked beside a lake at dawn",
  },
  {
    id: "summer-gear",
    tag: "Gear",
    read: "6 min",
    title: "Riding gear that survives Bangalore heat",
    excerpt:
      "Mesh jackets, summer gloves and the helmets members actually wear.",
    by: "u/meshjacket",
    date: "Aug 2026",
    src: photoUrl(5206863, 1200),
    alt: "Rider in helmet and gloves",
  },
  {
    id: "hampi-three-days",
    tag: "Ride report",
    read: "12 min",
    title: "Three days to Hampi and back",
    excerpt: "340 km each way, one puncture, zero regrets.",
    by: "u/boulderhopper",
    date: "Jul 2026",
    src: photoUrl(39135938, 1200),
    alt: "Adventure bikes lined up before a long ride",
  },
  {
    id: "monsoon-chain-care",
    tag: "Maintenance",
    read: "5 min",
    title: "Chain care in monsoon",
    excerpt: "Clean, lube, adjust: the 20-minute Sunday ritual.",
    by: "u/chainlube",
    date: "Jul 2026",
    src: photoUrl(347149, 1200),
    alt: "Motorcycle drivetrain close up",
  },
  {
    id: "sos-saved-my-weekend",
    tag: "Community",
    read: "4 min",
    title: "How the SOS group saved my weekend",
    excerpt:
      "Stranded near Hosur at 11 PM. Two members showed up in 40 minutes.",
    by: "u/stranded_no_more",
    date: "Jun 2026",
    src: photoUrl(5195501, 1200),
    alt: "Riders stopped at the side of a wet road",
  },
  {
    id: "first-bike-blr",
    tag: "Guide",
    read: "7 min",
    title: "First bike in Bangalore: what to buy",
    excerpt: "Traffic, parking, ghats: a decision tree from the sub.",
    by: "mods",
    date: "Jun 2026",
    src: photoUrl(9161722, 1200),
    alt: "Two-wheelers lined up on a city street",
  },
] as const;
