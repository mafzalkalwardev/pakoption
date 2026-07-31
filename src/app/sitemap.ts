import type { MetadataRoute } from "next";
import { getListings } from "@/lib/db/repository";
import { SITE } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/auctions`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/buy`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/sell`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/inspection`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/how-it-works`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/legal/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/privacy`, changeFrequency: "yearly", priority: 0.2 },
    {
      url: `${base}/legal/auction-rules`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const { data } = await getListings({ perPage: 500 });

  const listingRoutes: MetadataRoute.Sitemap = data.map((l) => ({
    url: `${base}${l.type === "AUCTION" ? "/auctions" : "/buy"}/${l.slug}`,
    changeFrequency: l.type === "AUCTION" ? "hourly" : "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...listingRoutes];
}
