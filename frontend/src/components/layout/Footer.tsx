import Link from "next/link";

const columns = [
  {
    title: "Resources",
    links: [
      { href: "/visa-guide", label: "Visa Guide" },
      { href: "/residence-permit", label: "Residence Permit" },
      { href: "/healthcare", label: "Healthcare" },
      { href: "/transportation", label: "Transportation" },
      { href: "/cost-of-living", label: "Cost of Living" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/jobs", label: "Student Jobs" },
      { href: "/accommodation", label: "Accommodation" },
      { href: "/universities", label: "Universities" },
      { href: "/scholarships", label: "Scholarships" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <p className="text-lg font-bold text-brand-blue">StudentLife Hungary</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Helping international students navigate life in Hungary — housing, jobs,
            scholarships, and everything in between.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-500 hover:text-brand-blue dark:text-slate-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
        © {new Date().getFullYear()} StudentLife Hungary. All rights reserved.
      </div>
    </footer>
  );
}
