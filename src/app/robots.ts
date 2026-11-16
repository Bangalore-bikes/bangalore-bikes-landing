import type { MetadataRoute } from "next";
import { isPreviewDeployment, siteOrigin } from "@/lib/siteMetadata";

export default function robots(): MetadataRoute.Robots {
  return isPreviewDeployment
    ? { rules: { userAgent: "*", disallow: "/" } }
    : {
        rules: { userAgent: "*", allow: "/" },
        sitemap: siteOrigin + "/sitemap.xml",
      };
}
