import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using StudentLife Hungary.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-400">Last updated: {new Date().getFullYear()}</p>
      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <h2>Using the site</h2>
        <p>
          StudentLife Hungary provides informational content and a platform for
          browsing and submitting listings related to student life in Hungary. You
          must provide accurate information when creating an account or submitting a
          listing.
        </p>
        <h2>User-submitted content</h2>
        <p>
          Job and accommodation listings submitted by users are reviewed before being
          published, but we don't independently verify every claim made in a listing.
          Use your own judgment before entering into any agreement based on a listing
          found here.
        </p>
        <h2>Prohibited use</h2>
        <ul>
          <li>Submitting false, misleading, or fraudulent listings</li>
          <li>Attempting to access other users' accounts</li>
          <li>Using the platform to scrape data at scale or disrupt normal operation</li>
        </ul>
        <h2>Content moderation</h2>
        <p>
          We reserve the right to remove any listing, comment, or account that
          violates these terms or is otherwise inappropriate, without prior notice.
        </p>
        <h2>No liability for external decisions</h2>
        <p>
          Guides on this site (visa, healthcare, housing, etc.) are general
          information, not legal, medical, or financial advice. Always confirm
          specifics with the relevant official authority or professional.
        </p>
        <h2>Changes to these terms</h2>
        <p>We may update these terms from time to time; continued use of the site constitutes acceptance of the current version.</p>
      </div>
    </div>
  );
}
