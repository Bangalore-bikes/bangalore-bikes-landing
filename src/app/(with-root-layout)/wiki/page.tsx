export { default } from "../_wiki/page";
import { createPageMetadata } from "@/lib/siteMetadata";

export const revalidate = 60;

export const metadata = createPageMetadata("/wiki");
