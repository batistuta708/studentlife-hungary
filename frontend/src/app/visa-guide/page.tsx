import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Visa Guide for Hungary",
  description: "Step-by-step guide to obtaining a Hungarian student visa for non-EU/EEA citizens.",
};

const steps = [
  {
    title: "Get accepted by a Hungarian institution",
    body: "You need a formal Letter of Admission before applying for a visa — this is a hard requirement, not optional documentation.",
  },
  {
    title: "Gather required documents",
    body: "Typically: valid passport, Letter of Admission, proof of financial means, proof of accommodation, health insurance, and passport photos. Requirements vary slightly by consulate — always confirm with the Hungarian embassy in your country.",
  },
  {
    title: "Apply for the D-visa (long-term)",
    body: "Non-EU/EEA students apply for a national (D) visa at their nearest Hungarian embassy or consulate, ideally several months before the semester starts — processing times vary widely by country.",
  },
  {
    title: "Enter Hungary and apply for a residence permit",
    body: "The D-visa allows entry and a short stay; within that window you apply for a residence permit for study purposes at the Immigration and Asylum Office, which covers your full study period.",
  },
  {
    title: "Register your address",
    body: "Once you have accommodation, you're generally required to register your address with local authorities — your university's international office can usually help with this step.",
  },
];

export default function VisaGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Student Visa Guide</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        A general overview of the process for non-EU/EEA students. Requirements change and vary by
        country of origin — always confirm current details with your nearest Hungarian embassy or
        consulate before applying.
      </p>

      <ol className="mt-10 space-y-8">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
        EU/EEA citizens do not need a visa to study in Hungary but should register their stay with
        local authorities if staying longer than 90 days.
      </p>
    </div>
  );
}
