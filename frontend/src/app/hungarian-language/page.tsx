import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Hungarian as a Student",
  description: "Tips and resources for international students learning Hungarian.",
};

export default function HungarianLanguagePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Learning Hungarian</h1>
      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <p>
          Most international degree programs in Hungary are taught fully in English,
          so you can complete your studies without fluent Hungarian — but picking up
          even basic conversational Hungarian makes daily life noticeably easier:
          navigating bureaucracy, shopping, and building relationships outside your
          program.
        </p>
        <h2>Where to start</h2>
        <ul>
          <li>
            Many universities offer free or discounted Hungarian courses for
            international students — check with your international office first.
          </li>
          <li>
            Language exchange meetups are common in university cities and a low-cost
            way to practice with native speakers.
          </li>
          <li>
            Apps like Duolingo cover Hungarian basics, though the language's grammar
            (extensive case system, vowel harmony) benefits from structured classroom
            instruction alongside self-study.
          </li>
        </ul>
        <h2>A few genuinely useful phrases to start with</h2>
        <ul>
          <li><strong>Szia</strong> — Hi (informal)</li>
          <li><strong>Köszönöm</strong> — Thank you</li>
          <li><strong>Elnézést</strong> — Excuse me / Sorry</li>
          <li><strong>Beszél angolul?</strong> — Do you speak English?</li>
          <li><strong>Nem értem</strong> — I don't understand</li>
        </ul>
      </div>
    </div>
  );
}
