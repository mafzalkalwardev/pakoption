import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Shared inspection reports are unlisted by design, and dashboards and
        // API routes have nothing useful for a crawler.
        disallow: ["/dashboard/", "/api/", "/inspection/report/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
