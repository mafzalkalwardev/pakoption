import type { MetadataRoute } from "next";
import { getListings } from "@/lib/db/repository";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/auctions"), changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/buy"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/sell"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/inspection"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/compare"), changeFrequency: "weekly", priority: 0.5 },
    { url: absoluteUrl("/how-it-works"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/pricing"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/inspection/book"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/sell/new"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.5 },
    { url: absoluteUrl("/legal/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/legal/privacy"), changeFrequency: "yearly", priority: 0.2 },
    {
      url: absoluteUrl("/legal/auction-rules"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const { data } = await getListings({ perPage: 500 });

  const listingRoutes: MetadataRoute.Sitemap = data.map((l) => ({
    url: absoluteUrl(`${l.type === "AUCTION" ? "/auctions" : "/buy"}/${l.slug}`),
    changeFrequency: l.type === "AUCTION" ? "hourly" : "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...listingRoutes];
}
