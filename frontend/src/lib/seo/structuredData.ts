const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studentlifehungary.com";

// Site-wide Organization + WebSite schema — included once in the root layout so every
// page benefits, without every page needing to redeclare who the publisher is.
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StudentLife Hungary",
    url: siteUrl,
    logo: `${siteUrl}/icons/logo.png`,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "StudentLife Hungary",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/blog?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleJsonLd(article: {
  title: string;
  excerpt: string;
  coverImage: { url: string };
  author: { name: string };
  publishedAt?: string;
  updatedAt?: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [article.coverImage.url],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: [{ "@type": "Person", name: article.author.name }],
    publisher: { "@type": "Organization", name: "StudentLife Hungary" },
    mainEntityOfPage: `${siteUrl}/blog/${article.slug}`,
  };
}

// JobPosting is a rich-result-eligible schema type in Google Search — using it
// correctly can surface listings directly in Google's dedicated Jobs UI.
export function jobPostingJsonLd(job: {
  title: string;
  description: string;
  company: { name: string };
  location: { city: string };
  employmentType: string;
  salary?: { min?: number; max?: number; currency: string; period: string };
  applicationDeadline?: string;
  createdAt: string;
  slug: string;
}) {
  const employmentTypeMap: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    internship: "INTERN",
    freelance: "CONTRACTOR",
    seasonal: "TEMPORARY",
  };

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: { "@type": "PropertyValue", name: "StudentLife Hungary", value: job.slug },
    datePosted: job.createdAt,
    validThrough: job.applicationDeadline,
    employmentType: employmentTypeMap[job.employmentType] || "OTHER",
    hiringOrganization: { "@type": "Organization", name: job.company.name },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location.city, addressCountry: "HU" },
    },
    ...(job.salary?.min && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.salary.currency,
        value: { "@type": "QuantitativeValue", minValue: job.salary.min, maxValue: job.salary.max, unitText: job.salary.period.toUpperCase() },
      },
    }),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}
