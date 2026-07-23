import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "@/components/shared/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structuredData";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studentlifehungary.com";

// Site-wide defaults — individual pages override title/description via generateMetadata
// (see app/blog/[slug]/page.tsx for the pattern every content page follows).
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "StudentLife Hungary — Housing, Jobs & Guides for International Students",
    template: "%s | StudentLife Hungary",
  },
  description:
    "Everything international students need in Hungary: accommodation, student jobs, scholarships, university guides, visa help, and more.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "StudentLife Hungary",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
