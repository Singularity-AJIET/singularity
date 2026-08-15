import { getSiteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";


export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}