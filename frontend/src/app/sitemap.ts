import type { MetadataRoute } from "next";
import { apiClient } from "@/lib/api/client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studentlifehungary.com";

const staticRoutes = [
  "",
  "/about",
  "/blog",
  "/jobs",
  "/accommodation",
  "/universities",
  "/scholarships",
  "/visa-guide",
  "/residence-permit",
  "/healthcare",
  "/transportation",
  "/hungarian-language",
  "/cost-of-living",
  "/faq",
  "/contact",
  "/privacy-policy",
  "/terms",
];

// Next.js's App Router picks this up automatically and serves it at /sitemap.xml —
// no manual XML string-building needed. Runs at request time (or build time for
// static export), so it always reflects what's actually published right now rather
// than going stale between deploys.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/blog" ? "daily" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  // Best-effort: if the API is unreachable at build time, still ship the static routes
  // rather than failing the entire sitemap (and the build with it).
  const [articles, jobs, accommodation, universities, scholarships] = await Promise.allSettled([
    apiClient.get("/articles", { params: { limit: 200, fields: "slug,updatedAt", status: "published" } }),
    apiClient.get("/jobs", { params: { limit: 200, fields: "slug,updatedAt", status: "approved" } }),
    apiClient.get("/accommodation", { params: { limit: 200, fields: "slug,updatedAt", status: "approved" } }),
    apiClient.get("/universities", { params: { limit: 200, fields: "slug,updatedAt" } }),
    apiClient.get("/scholarships", { params: { limit: 200, fields: "slug,updatedAt" } }),
  ]);

  const dynamicEntries: MetadataRoute.Sitemap = [];

  const addEntries = (result: PromiseSettledResult<any>, basePath: string, priority: number) => {
    if (result.status === "fulfilled") {
      for (const item of result.value.data.data as { slug: string; updatedAt?: string }[]) {
        dynamicEntries.push({
          url: `${siteUrl}${basePath}/${item.slug}`,
          lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority,
        });
      }
    }
  };

  addEntries(articles, "/blog", 0.8);
  addEntries(jobs, "/jobs", 0.6);
  addEntries(accommodation, "/accommodation", 0.6);
  addEntries(universities, "/universities", 0.7);
  addEntries(scholarships, "/scholarships", 0.6);

  return [...staticEntries, ...dynamicEntries];
}
