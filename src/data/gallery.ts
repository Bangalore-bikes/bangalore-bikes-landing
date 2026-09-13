import { photoUrl, posterUrl, videoUrl } from "./media";

export type Shot = {
  readonly id: string;
  readonly caption: string;
  readonly by: string;
  readonly place: string;
  readonly tag: string;
  readonly alt: string;
  readonly thumb: string;
  readonly full: string;
  readonly video?: string;
};

const photo = (
  id: number,
  rest: Omit<Shot, "thumb" | "full" | "video">,
): Shot => ({
  ...rest,
  thumb: photoUrl(id, 900),
  full: photoUrl(id, 1800),
});

const video = (
  id: number,
  rest: Omit<Shot, "thumb" | "full" | "video">,
): Shot => ({
  ...rest,
  thumb: posterUrl(id, 900),
  full: posterUrl(id, 1800),
  video: videoUrl(id),
});

export const SHOTS: readonly Shot[] = [
  video(37375289, {
    id: "gal-1",
    caption: "Peak hour, full lane",
    by: "via Pexels",
    place: "City intersection",
    tag: "Rides",
    alt: "Busy city intersection, motorbikes everywhere",
  }),
  photo(5195501, {
    id: "gal-2",
    caption: "Wet tarmac, two up front",
    by: "via Pexels",
    place: "Highway",
    tag: "Ghats",
    alt: "Riders on a wet road",
  }),
  photo(14067426, {
    id: "gal-3",
    caption: "Parked by the water",
    by: "via Pexels",
    place: "Lakeside",
    tag: "Rides",
    alt: "Motorbikes parked beside a lake",
  }),
  video(5198949, {
    id: "gal-4",
    caption: "Flyover, monsoon grey",
    by: "via Pexels",
    place: "City flyover",
    tag: "Night",
    alt: "Two riders on a rainy flyover",
  }),
  photo(39135938, {
    id: "gal-5",
    caption: "ADVs at the trailhead",
    by: "via Pexels",
    place: "Trailhead",
    tag: "Machines",
    alt: "Adventure dirt bikes parked outdoors",
  }),
  photo(37407541, {
    id: "gal-6",
    caption: "Nothing but horizon",
    by: "via Pexels",
    place: "Desert road",
    tag: "Rides",
    alt: "Biker in a desert landscape",
  }),
  video(39144571, {
    id: "gal-7",
    caption: "Bar-cam, mountain road",
    by: "via Pexels",
    place: "High country",
    tag: "Ghats",
    alt: "Handlebar view of a mountain road",
  }),
  photo(5206863, {
    id: "gal-8",
    caption: "Gear on, ready to roll",
    by: "via Pexels",
    place: "City street",
    tag: "Machines",
    alt: "Rider in helmet and gloves on a cafe racer",
  }),
  photo(9161722, {
    id: "gal-9",
    caption: "Scooter row",
    by: "via Pexels",
    place: "City street",
    tag: "Machines",
    alt: "Scooters lined up on the road",
  }),
  video(5198919, {
    id: "gal-10",
    caption: "Headlights on, traffic thick",
    by: "via Pexels",
    place: "City street",
    tag: "Night",
    alt: "Riders in evening city traffic",
  }),
  photo(347149, {
    id: "gal-11",
    caption: "Clean lines",
    by: "via Pexels",
    place: "Roadside",
    tag: "Machines",
    alt: "Standard motorcycle on the road",
  }),
] as const;
