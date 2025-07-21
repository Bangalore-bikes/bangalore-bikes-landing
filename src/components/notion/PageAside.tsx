import { type Block, type ExtendedRecordMap } from "notion-types";

import { PageSocial } from "./PageSocial";

export function PageAside({
  block,
}: {
  block: Block;
  recordMap: ExtendedRecordMap;
  isBlogPost: boolean;
}) {
  if (!block) {
    return null;
  }

  // only display comments and page actions on blog post pages
  // if (isBlogPost) {
  //   const tweet = getPageTweet(block, recordMap);
  //   if (!tweet) {
  //     return null;
  //   }

  //   return <PageActions tweet={tweet} />;
  // }

  return <PageSocial />;
}
