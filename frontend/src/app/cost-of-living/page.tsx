import type { Metadata } from "next";
import { CostOfLivingCalculator } from "@/components/shared/CostOfLivingCalculator";

export const metadata: Metadata = {
  title: "Cost of Living Calculator — Hungary",
  description: "Estimate your monthly student budget across Hungarian cities.",
};

export default function CostOfLivingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Cost of Living Calculator</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Get a rough estimate of your monthly budget as a student in Hungary.
      </p>
      <div className="mt-8">
        <CostOfLivingCalculator />
      </div>
    </div>
  );
}
