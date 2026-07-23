import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Residence Permit Guide",
  description: "How to apply for and renew your Hungarian residence permit as an international student.",
};

export default function ResidencePermitPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Residence Permit Guide</h1>
      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <p>
          If you're a non-EU/EEA student staying in Hungary for longer than your initial
          D-visa allows, you'll need a residence permit for study purposes, issued by
          the National Directorate-General for Aliens Policing (formerly the
          Immigration and Asylum Office).
        </p>
        <h2>What you'll typically need</h2>
        <ul>
          <li>A valid passport</li>
          <li>Proof of enrollment at a Hungarian institution</li>
          <li>Proof of accommodation (a lease or dormitory confirmation)</li>
          <li>Proof of sufficient financial means for the study period</li>
          <li>Valid health insurance covering your stay</li>
          <li>A completed application form and the relevant fee</li>
        </ul>
        <h2>Timing</h2>
        <p>
          Apply as early as possible after arriving in Hungary — processing can take
          several weeks, and you're expected to have your documentation in order well
          before your D-visa's validity runs out.
        </p>
        <h2>Renewal</h2>
        <p>
          Residence permits for study are typically issued for a limited period and
          need renewing before they expire — mark your calendar well ahead of the
          expiry date, since a lapsed permit can complicate your legal status.
        </p>
        <p className="text-sm text-slate-500">
          This is general guidance, not legal advice — requirements can change, so
          always confirm current rules with your university's international office or
          the National Directorate-General for Aliens Policing directly.
        </p>
      </div>
    </div>
  );
}
