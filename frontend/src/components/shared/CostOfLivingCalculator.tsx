"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";

// Rough monthly baseline estimates in HUF, deliberately conservative/illustrative —
// framed to the user as such rather than presented as precise, since real costs vary
// a lot by lifestyle and change over time.
const cityBaselines: Record<string, { rent: number; food: number; transport: number }> = {
  Budapest: { rent: 180000, food: 90000, transport: 10000 },
  Szeged: { rent: 100000, food: 70000, transport: 6000 },
  Debrecen: { rent: 95000, food: 65000, transport: 6000 },
  Pécs: { rent: 90000, food: 65000, transport: 5000 },
};

export function CostOfLivingCalculator() {
  const [city, setCity] = useState("Budapest");
  const [roommates, setRoommates] = useState(0);
  const [extras, setExtras] = useState(20000);

  const estimate = useMemo(() => {
    const base = cityBaselines[city];
    const rent = Math.round(base.rent / (roommates + 1));
    const total = rent + base.food + base.transport + extras;
    return { rent, food: base.food, transport: base.transport, total };
  }, [city, roommates, extras]);

  return (
    <Card>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="col-city" className="text-sm font-medium">
            City
          </label>
          <select id="col-city" value={city} onChange={(e) => setCity(e.target.value)} className="input mt-1">
            {Object.keys(cityBaselines).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="col-roommates" className="text-sm font-medium">
            Roommates sharing rent
          </label>
          <input
            id="col-roommates"
            type="number"
            min={0}
            max={5}
            value={roommates}
            onChange={(e) => setRoommates(Math.max(0, Number(e.target.value)))}
            className="input mt-1"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="col-extras" className="text-sm font-medium">
            Other monthly spending (entertainment, phone, etc.) — HUF
          </label>
          <input
            id="col-extras"
            type="number"
            min={0}
            step={5000}
            value={extras}
            onChange={(e) => setExtras(Math.max(0, Number(e.target.value)))}
            className="input mt-1"
          />
        </div>
      </div>

      <div className="mt-8 space-y-2 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
        <div className="flex justify-between">
          <span className="text-slate-500">Rent (your share)</span>
          <span>{estimate.rent.toLocaleString()} HUF</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Food</span>
          <span>{estimate.food.toLocaleString()} HUF</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Transport</span>
          <span>{estimate.transport.toLocaleString()} HUF</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Other</span>
          <span>{extras.toLocaleString()} HUF</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold dark:border-slate-800">
          <span>Estimated monthly total</span>
          <span className="text-brand-orange">{estimate.total.toLocaleString()} HUF</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Rough estimate for illustration only — actual costs vary by lifestyle and change over time.
        Browse real{" "}
        <a href="/accommodation" className="text-brand-blue">
          accommodation listings
        </a>{" "}
        for current rent prices.
      </p>
    </Card>
  );
}
