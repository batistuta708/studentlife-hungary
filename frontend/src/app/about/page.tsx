import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about StudentLife Hungary's mission to help international students navigate life in Hungary.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">About StudentLife Hungary</h1>
      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <p>
          StudentLife Hungary was built for one reason: moving to a new country for
          university is hard enough without also having to piece together housing,
          visa rules, banking, and job opportunities from a dozen different websites,
          forums, and word-of-mouth tips.
        </p>
        <p>
          We bring together everything an international student needs to actually
          settle in — verified accommodation listings, part-time job postings,
          scholarship opportunities, university comparisons, and practical guides on
          the things nobody explains clearly enough: visas, residence permits,
          healthcare, and getting around.
        </p>
        <h2>What we offer</h2>
        <ul>
          <li>Curated accommodation and job listings, moderated before they go live</li>
          <li>University and scholarship comparisons across Hungary</li>
          <li>Practical guides written for the specific situation of an international student</li>
          <li>A community blog covering real experiences, not just official advice</li>
        </ul>
        <p>
          Whether you're just starting your application or already here and looking
          for your next apartment, we hope this makes the process a little less
          overwhelming.
        </p>
      </div>
    </div>
  );
}
