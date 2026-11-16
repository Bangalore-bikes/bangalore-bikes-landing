import type { MetadataRoute } from "next";
import {
  isPreviewDeployment,
  publicPages,
  siteOrigin,
} from "@/lib/siteMetadata";

export default function sitemap(): MetadataRoute.Sitemap {
  if (isPreviewDeployment) return [];
  return Object.entries(publicPages)
    .filter(([, page]) => page.index)
    .map(([path]) => ({ url: siteOrigin + path }));
}
