import { photoUrl } from "./media";
import type { RideLevel } from "./rides";

export type Destination = {
  readonly id: string;
  readonly name: string;
  readonly km: string;
  readonly type: string;
  readonly dur: string;
  readonly best: string;
  readonly level: RideLevel;
  readonly desc: string;
  readonly src: string;
  readonly alt: string;
};

export const DESTINATIONS: readonly Destination[] = [
  {
    id: "nandi",
    name: "Nandi Hills",
    km: "60 km",
    type: "Hill · sunrise",
    dur: "1.5 h",
    best: "Oct–Mar",
    level: "Easy",
    desc: "The classic 5 AM run. Twisties on the final climb, breakfast at the top, back before the city wakes.",
    src: photoUrl(37407541, 900),
    alt: "Nandi Hills sunrise road",
  },
  {
    id: "sakleshpur",
    name: "Sakleshpur",
    km: "220 km",
    type: "Ghats · coffee",
    dur: "4.5 h",
    best: "Sep–Feb",
    level: "Moderate",
    desc: "Shiradi Ghat, misty estates and the Manjarabad Fort. Ideal overnighter with homestays everywhere.",
    src: photoUrl(5195501, 900),
    alt: "Misty ghat road near Sakleshpur",
  },
  {
    id: "coorg",
    name: "Coorg (Madikeri)",
    km: "260 km",
    type: "Hill · coffee",
    dur: "5.5 h",
    best: "Oct–May",
    level: "Moderate",
    desc: "Coffee estates, Abbey Falls, Raja's Seat. Two days minimum; roads via Kushalnagar are the smoothest.",
    src: photoUrl(39135938, 900),
    alt: "Coffee estate road in Coorg",
  },
  {
    id: "chikmagalur",
    name: "Chikmagalur",
    km: "245 km",
    type: "Peak · coffee",
    dur: "5 h",
    best: "Sep–May",
    level: "Moderate",
    desc: "Mullayanagiri, Karnataka's highest peak, then Baba Budangiri. Steep hairpins near the top.",
    src: photoUrl(347149, 900),
    alt: "Hairpin bends near Mullayanagiri",
  },
  {
    id: "hampi",
    name: "Hampi",
    km: "340 km",
    type: "Heritage · boulders",
    dur: "6.5 h",
    best: "Nov–Feb",
    level: "Challenging",
    desc: "UNESCO ruins, coracle rides and boulder sunsets. Long highway day; leave before 5 AM.",
    src: photoUrl(9161722, 900),
    alt: "Boulder landscape at Hampi",
  },
  {
    id: "gokarna",
    name: "Gokarna",
    km: "480 km",
    type: "Beach · coast",
    dur: "9 h",
    best: "Oct–Mar",
    level: "Challenging",
    desc: "Om Beach, Kudle, and the coastal NH66. Break the ride at Shimoga or Sirsi for a saner day.",
    src: photoUrl(14067426, 900),
    alt: "Coastal road near Gokarna",
  },
] as const;
