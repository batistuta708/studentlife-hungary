import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Common questions from international students about studying and living in Hungary.",
};

const faqs = [
  {
    q: "Do I need a visa to study in Hungary?",
    a: "Non-EU/EEA citizens generally need a long-term (D) visa or residence permit for studies. EU/EEA citizens don't need a visa but should register their stay if it exceeds 90 days. See our Visa Guide for the full process.",
  },
  {
    q: "Can international students work while studying?",
    a: "Yes. Non-EU students on a valid residence permit can generally work part-time during term (up to 24 hours/week) and full-time during official breaks, though exact limits depend on your permit type — check with your university's international office.",
  },
  {
    q: "How much does student accommodation cost?",
    a: "It varies significantly by city and type. University dormitories are the cheapest option; shared apartments in Budapest typically cost more than in smaller cities like Szeged or Debrecen. Browse current listings on our Accommodation page for real pricing.",
  },
  {
    q: "Is healthcare included for international students?",
    a: "EU/EEA students can generally use their European Health Insurance Card. Non-EU students typically need private health insurance, which is often a requirement for the residence permit application itself. See our Healthcare guide for details.",
  },
  {
    q: "How do I open a bank account?",
    a: "Most Hungarian banks require proof of enrollment, a residence permit or visa, and a local address. Some banks offer accounts specifically designed for international students — we cover this in more detail on our Blog.",
  },
  {
    q: "Are there scholarships specifically for international students?",
    a: "Yes — the Stipendium Hungaricum program is the largest, covering tuition and providing a stipend for students from partner countries. Check our Scholarships page for current opportunities and deadlines.",
  },
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Common questions from international students. Can't find your answer? Reach out on our{" "}
        <a href="/contact" className="text-brand-blue">
          Contact page
        </a>
        .
      </p>

      <div className="mt-10 space-y-6">
        {faqs.map((item) => (
          <div key={item.q} className="border-b border-slate-200 pb-6 dark:border-slate-800">
            <h2 className="font-semibold">{item.q}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
