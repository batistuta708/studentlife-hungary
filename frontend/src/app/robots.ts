import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studentlifehungary.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Dashboard/admin are session-gated anyway, but excluding them from crawling
        // also stops crawlers wasting budget on pages they can never actually index.
        disallow: ["/dashboard", "/admin", "/api", "/reset-password", "/verify-email"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
