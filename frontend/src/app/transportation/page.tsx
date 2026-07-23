import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transportation Guide",
  description: "Getting around Hungary as a student — public transit, discounts, and intercity travel.",
};

export default function TransportationPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Transportation Guide</h1>
      <div className="prose prose-slate mt-6 max-w-none dark:prose-invert">
        <h2>Public transit in Budapest</h2>
        <p>
          Budapest has an extensive metro, tram, bus, and trolleybus network run by
          BKK. Students under 26 with a valid Hungarian student ID typically qualify
          for significantly discounted monthly passes — worth arranging as soon as
          your student ID is issued.
        </p>
        <h2>Other cities</h2>
        <p>
          Szeged, Debrecen, Pécs, and other university cities have their own local
          transit systems, generally tram and bus based, with similar student
          discounts available through local providers.
        </p>
        <h2>Getting between cities</h2>
        <p>
          MÁV (Hungarian State Railways) connects most major cities affordably, and
          also offers student discounts. Intercity buses (Volánbusz) cover routes rail
          doesn't reach as directly.
        </p>
        <h2>Biking and walking</h2>
        <p>
          Budapest and several other cities have expanded bike lane networks and
          bike-share programs (like MOL Bubi in Budapest) — a genuinely practical
          option for shorter trips, especially in warmer months.
        </p>
      </div>
    </div>
  );
}
