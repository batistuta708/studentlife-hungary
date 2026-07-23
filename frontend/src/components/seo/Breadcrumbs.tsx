import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { breadcrumbJsonLd } from "@/lib/seo/structuredData";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// Renders the visible breadcrumb trail AND emits its BreadcrumbList JSON-LD in one
// place, so the two never drift out of sync (a common SEO bug — visible breadcrumbs
// that don't match the structured data actually get flagged by Search Console).
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const allItems = [{ name: "Home", url: "/" }, ...items];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(allItems)) }} />
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        {allItems.map((item, i) => {
          const isLast = i === allItems.length - 1;
          return (
            <span key={item.url} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} />}
              {isLast ? (
                <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
              ) : (
                <Link href={item.url} className="hover:text-brand-blue">
                  {item.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
