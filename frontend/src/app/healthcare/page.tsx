import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Healthcare Guide for International Students",
  description: "How healthcare and health insurance work for international students in Hungary.",
};

export default function HealthcarePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Healthcare Guide</h1>
      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <h2>EU/EEA students</h2>
        <p>
          Your European Health Insurance Card (EHIC) generally covers necessary
          state-provided healthcare during your stay, on the same terms as Hungarian
          citizens. Bring it with you and keep it accessible.
        </p>
        <h2>Non-EU students</h2>
        <p>
          You'll typically need private health insurance for the duration of your
          stay — this is usually a requirement for your residence permit application,
          not just a recommendation. Many universities offer or require a specific
          insurance package for international students; check with your institution
          before arranging insurance independently.
        </p>
        <h2>Where to go</h2>
        <ul>
          <li>
            <strong>Non-emergency care:</strong> most universities have a student
            health center or affiliated clinic — this is usually your first stop.
          </li>
          <li>
            <strong>Pharmacies (gyógyszertár):</strong> widely available for
            over-the-counter and prescribed medication.
          </li>
          <li>
            <strong>Emergency:</strong> dial <strong>112</strong> for emergency
            services anywhere in Hungary (works across the EU).
          </li>
        </ul>
        <p className="text-sm text-slate-500">
          This is general guidance, not medical or legal advice. Confirm your specific
          coverage and requirements with your university and insurance provider.
        </p>
      </div>
    </div>
  );
}
