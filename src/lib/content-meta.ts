export const collectionNames = ["articles", "rides", "resources"] as const;
export type CollectionName = (typeof collectionNames)[number];

export const collectionLabels: Record<
  CollectionName,
  { singular: string; plural: string }
> = {
  articles: { singular: "Community story", plural: "Community stories" },
  rides: { singular: "Ride", plural: "Rides" },
  resources: { singular: "Resource link", plural: "Resource links" },
};

export function isCollectionName(value: string): value is CollectionName {
  return (collectionNames as readonly string[]).includes(value);
}
