export const communityLinks = {
  subreddit: "https://www.reddit.com/r/bangalorebikes/",
  modmail: "https://www.reddit.com/message/compose/?to=%2Fr%2Fbangalorebikes",
  whatsapp: "https://chat.whatsapp.com/BtOk3R3w4FPK36zMy3UmQD",
  whatsappShort: "https://tinyurl.com/bangalorebikeswa",
} as const;

export function resourceCorrectionUrl(title: string, sourceUrl: string) {
  const url = new URL(communityLinks.modmail);
  url.searchParams.set("subject", "Website resource correction: " + title);
  url.searchParams.set(
    "message",
    "Resource: " +
      title +
      "\nSource: " +
      sourceUrl +
      "\n\nSuggested correction:\n",
  );
  return url.toString();
}
