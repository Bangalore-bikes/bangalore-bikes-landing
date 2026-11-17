import type { CommunityPost } from "@/lib/communityFeed";

// Explicit editorial fallback. These are not presented as live trending posts.
export const communityHighlights: CommunityPost[] = [
  {
    id: "1smqhi8",
    title: "Service update (with location)",
    url: "https://www.reddit.com/r/bangalorebikes/comments/1smqhi8/service_update_with_location/",
    author: "AkhiHasItAll",
    summary:
      "A rider shares their workshop experience and the location mentioned in the original discussion.",
    imageUrl:
      "https://preview.redd.it/service-update-with-location-v0-y2w04u7bpgvg1.jpeg?auto=webp&crop=smart&s=db025e9adf649cb46bf2b7cce323d5481c39f2bb&width=640",
    imageAlt: "Preview image attached to the community service-update post",
  },
  {
    id: "1td5o8v",
    title: "Bangalore Bikes — Ride Emergency SOP",
    url: "https://www.reddit.com/r/bangalorebikes/comments/1td5o8v/bangalore_bikes_ride_emergency_sop_v10/",
    summary:
      "The community's published guidance on emergency contacts and coordinating a ride group.",
  },
  {
    id: "1waqjsy",
    title: "Community standards, respect, and why we're here",
    url: "https://www.reddit.com/r/bangalorebikes/comments/1waqjsy/a_quick_reminder_on_community_standards_respect/",
    summary:
      "A moderation-team reminder about inclusion and respectful community conversations.",
  },
  {
    id: "1we7dob",
    title: "Respecting member inboxes",
    url: "https://www.reddit.com/r/bangalorebikes/comments/1we7dob/community_notice_respecting_member_inboxes_zero/",
    summary:
      "Why members should ask before messaging and keep useful questions public.",
  },
];
