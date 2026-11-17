import type { CommunityArticle } from "./articleSchema";
import type { CommunityResource } from "./resourceSchema";
import type { Ride } from "./rideSchema";

/** Schema-valid starting points for the admin editor, never published content. */
export function newRecordTemplate(
  collection: "articles" | "rides" | "resources",
): CommunityArticle | Ride | CommunityResource {
  const now = new Date();
  const iso = now.toISOString();
  const start = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  if (collection === "articles") {
    return {
      slug: "new-story",
      title: "",
      summary: "",
      author: "",
      status: "draft",
      permissionConfirmed: false,
      updatedAt: iso,
      blocks: [{ type: "paragraph", text: "" }],
      sources: [],
    } satisfies CommunityArticle;
  }
  if (collection === "rides") {
    return {
      slug: "new-ride",
      title: "",
      description: "",
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      meetingPoint: "",
      destination: "",
      distanceKm: 1,
      organizer: "",
      experience: "",
      redditUrl: "",
      updatedAt: iso,
      confirmed: true,
      status: "scheduled",
    } as Ride;
  }
  return {
    id: "new-resource",
    title: "",
    category: "Community",
    summary: "",
    url: "",
    sourceLabel: "Community notice on r/BangaloreBikes",
    sourceCheckedOn: iso.slice(0, 10),
    status: "draft",
  } as CommunityResource;
}
