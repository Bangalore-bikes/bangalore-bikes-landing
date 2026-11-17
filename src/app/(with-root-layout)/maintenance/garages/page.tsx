export { default } from "../../_maintenance/garages/page";
import { createPageMetadata } from "@/lib/siteMetadata";

export const revalidate = 60;

export const metadata = createPageMetadata("/maintenance/garages");
