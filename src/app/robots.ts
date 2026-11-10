import type { MetadataRoute } from "next";
import { AI_CRAWLERS, DISALLOWED_PATHS, getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const shared = {
    allow: "/",
    disallow: [...DISALLOWED_PATHS],
  };

  return {
    rules: [
      { userAgent: "*", ...shared },
      { userAgent: [...AI_CRAWLERS], ...shared },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
