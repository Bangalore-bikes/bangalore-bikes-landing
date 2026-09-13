import { photoUrl } from "./media";

export type RideLevel = "Easy" | "Moderate" | "Challenging";

export type Ride = {
  readonly id: string;
  readonly title: string;
  readonly day: string;
  readonly mon: string;
  readonly dow: string;
  readonly time: string;
  readonly meet: string;
  readonly meta: string;
  readonly type: string;
  readonly level: RideLevel;
  readonly src: string;
  readonly alt: string;
};

export type RideDetail = Ride & {
  readonly desc: string;
  readonly facts: readonly { readonly k: string; readonly v: string }[];
  readonly plan: readonly { readonly t: string; readonly s: string }[];
};

export const NEXT_RIDE: RideDetail = {
  id: "ride-nandi",
  title: "Nandi Hills sunrise run",
  day: "13",
  mon: "Sep",
  dow: "Sat",
  time: "5:00 AM",
  meet: "Hebbal flyover, below the bridge",
  meta: "60 km · Easy · Breakfast at the top",
  type: "Sunrise",
  level: "Easy",
  src: photoUrl(37407541, 1400),
  alt: "Rider on an open road at sunrise",
  desc: "The classic. 60 km of empty highway, the final climb's twisties as the sky turns, breakfast at the top and home before the city wakes.",
  facts: [
    { k: "Distance", v: "60 km" },
    { k: "Ride level", v: "Easy" },
    { k: "Back by", v: "10:30 AM" },
  ],
  plan: [
    { t: "5:00", s: "Meet at Hebbal. Fuel up before, not after." },
    { t: "5:20", s: "Roll out. Staggered formation on NH44." },
    { t: "6:30", s: "Sunrise at the top. Regroup, photos, breakfast." },
    {
      t: "8:30",
      s: "Ride down together to Devanahalli, then everyone's on their own.",
    },
  ],
};

export const PLANNED_RIDES: readonly Ride[] = [
  {
    id: "ride-sakleshpur",
    title: "Sakleshpur weekender",
    day: "27",
    mon: "Sep",
    dow: "Sat",
    time: "5:30 AM",
    meet: "Nelamangala toll",
    meta: "220 km · Moderate · Homestay",
    type: "Weekend",
    level: "Moderate",
    src: photoUrl(5195501, 900),
    alt: "Riders on a misty ghat road",
  },
] as const;

/** Home page teaser: the confirmed ride plus whatever else is on the calendar. */
export const UPCOMING_RIDES: readonly Ride[] = [
  { ...NEXT_RIDE, meet: "Hebbal flyover", src: photoUrl(37407541, 900) },
  ...PLANNED_RIDES,
] as const;

export const RIDE_GUIDES: readonly {
  readonly title: string;
  readonly items: readonly string[];
}[] = [
  {
    title: "Bike requirements",
    items: [
      "Well-maintained bike, any brand",
      "Valid registration & insurance",
      "Full fuel tank at start",
      "Basic toolkit and puncture kit",
    ],
  },
  {
    title: "Safety first",
    items: [
      "Certified helmet, mandatory",
      "Protective gear recommended",
      "Follow lead and sweep",
      "Stay with the group",
    ],
  },
  {
    title: "What to bring",
    items: [
      "Driving licence",
      "Emergency contact details",
      "Water & snacks",
      "Cash for tolls and parking",
    ],
  },
] as const;
