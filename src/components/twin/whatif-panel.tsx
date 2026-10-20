"use client";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, RotateCcw } from "lucide-react";
import { buildTwin } from "@/services/engine";
import type { Overrides, Persona } from "@/types/twin";
import { Card, CardTitle } from "@/components/ui/card";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { cn, fmtDate, inr, pct } from "@/lib/utils";

interface Controls { extraSip: number; expenseCutPct: number; incomeChangePct: number; oneTimeShock: number; marketDropPct: number; equityReturnPct: number }
const ZERO: Controls = { extraSip: 0, expenseCutPct: 0, incomeChangePct: 0, oneTimeShock: 0, marketDropPct: 0, equityReturnPct: 11.5 };

const PRESETS: { label: string; apply: Partial<Controls> }[] = [
  { label: "Today", apply: {} },
  { label: "Salary +15%", apply: { incomeChangePct: 15 } },
  { label: "Cut spending 10%", apply: { expenseCutPct: 10 } },
  { label: "Add ₹5k SIP", apply: { extraSip: 5000 } },
  { label: "Medical bill ₹1.5L", apply: { oneTimeShock: 150000 } },
  { label: "Income drops 30%", apply: { incomeChangePct: -30 } },
  { label: "Market falls 25%", apply: { marketDropPct: 25 } },
];

const SLIDERS: { key: keyof Controls; label: string; min: number; max: number; step: number; fmt: (v: number) => string }[] = [
  { key: "incomeChangePct", label: "Income change", min: -40, max: 30, step: 1, fmt: (v) => `${v > 0 ? "+" : ""}${v}%` },
  { key: "expenseCutPct", label: "Discretionary spending cut", min: 0, max: 30, step: 1, fmt: (v) => `${v}%` },
  { key: "extraSip", label: "Extra monthly SIP", min: 0, max: 30000, step: 500, fmt: (v) => inr(v) },
  { key: "oneTimeShock", label: "One-time expense this month", min: 0, max: 300000, step: 5000, fmt: (v) => inr(v) },
  { key: "marketDropPct", label: "Equity market fall", min: 0, max: 40, step: 1, fmt: (v) => `-${v}%` },
  { key: "equityReturnPct", label: "Expected equity return / yr", min: 6, max: 15, step: 0.5, fmt: (v) => `${v.toFixed(1)}%` },
];

function Diff({ before, after, fmt, higherIsBetter = true }: { before: number; after: number; fmt: (n: number) => string; higherIsBetter?: boolean }) {
  const d = after - before;
  const same = Math.abs(d) < 1e-9;
  const good = higherIsBetter ? d > 0 : d < 0;
  const Icon = same ? ArrowRight : d > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="num text-xl font-semibold text-slate-900">{fmt(after)}</span>
        {!same && <span className="num text-xs text-slate-400 line-through">{fmt(before)}</span>}
      </div>
      <span className={cn("mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", same ? "bg-slate-100 text-slate-500" : good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
        <Icon className="h-3 w-3" aria-hidden="true" />
        {same ? "No change" : fmt(Math.abs(d))}
      </span>
    </div>
  );
}

export function WhatIfPanel({ persona, asOf }: { persona: Persona; asOf: string }) {
  const [c, setC] = useState<Controls>(ZERO);
  const [preset, setPreset] = useState("Today");

  const base = useMemo(() => buildTwin(persona, {}, asOf), [persona, asOf]);
  const overrides: Overrides = {
    extraSip: c.extraSip, expenseCutPct: c.expenseCutPct, incomeChangePct: c.incomeChangePct,
    oneTimeShock: c.oneTimeShock, marketDropPct: c.marketDropPct,
    equityReturn: c.equityReturnPct === 11.5 ? undefined : c.equityReturnPct / 100,
  };
  const sim = useMemo(() => buildTwin(persona, overrides, asOf), [persona, asOf, c]); // eslint-disable-line react-hooks/exhaustive-deps
  const nw5 = (t: typeof base) => t.projection[5].base;

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit">
        <CardTitle hint="Move a lever and the whole twin recomputes instantly." right={
          <button onClick={() => { setC(ZERO); setPreset("Today"); }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100">
            <RotateCcw className="h-3 w-3" aria-hidden="true" /> Reset
          </button>
        }>Scenario levers</CardTitle>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => { setC({ ...ZERO, ...p.apply }); setPreset(p.label); }}
              className={cn("rounded-full border px-3 py-1 text-xs font-medium transition", preset === p.label ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="space-y-5">
          {SLIDERS.map((s) => (
            <div key={s.key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <label htmlFor={s.key} className="font-medium text-slate-700">{s.label}</label>
                <span className="num text-slate-500">{s.fmt(c[s.key])}</span>
              </div>
              <input id={s.key} type="range" min={s.min} max={s.max} step={s.step} value={c[s.key]}
                onChange={(e) => { setC({ ...c, [s.key]: Number(e.target.value) }); setPreset(""); }} />
            </div>
          ))}
        </div>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardTitle hint="Scenario compared with today's twin">Impact summary</CardTitle>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <div><p className="mb-1 text-xs text-slate-500">Health score</p><Diff before={base.score} after={sim.score} fmt={(n) => String(Math.round(n))} /></div>
            <div><p className="mb-1 text-xs text-slate-500">Emergency runway</p><Diff before={base.emergencyMonths} after={sim.emergencyMonths} fmt={(n) => `${n.toFixed(1)} mo`} /></div>
            <div><p className="mb-1 text-xs text-slate-500">Lowest balance (90d)</p><Diff before={base.stress.minBalance} after={sim.stress.minBalance} fmt={(n) => inr(n, true)} /></div>
            <div><p className="mb-1 text-xs text-slate-500">Days below floor</p><Diff before={base.stress.daysBelowFloor} after={sim.stress.daysBelowFloor} fmt={(n) => String(Math.round(n))} higherIsBetter={false} /></div>
            <div><p className="mb-1 text-xs text-slate-500">Net worth in 5 years</p><Diff before={nw5(base)} after={nw5(sim)} fmt={(n) => inr(n, true)} /></div>
            <div><p className="mb-1 text-xs text-slate-500">Monthly surplus</p><Diff before={base.monthlySurplus} after={sim.monthlySurplus} fmt={(n) => inr(n, true)} /></div>
          </div>
        </Card>

        <Card>
          <CardTitle hint="Grey is today, teal is your scenario">Projected cash balance</CardTitle>
          <ForecastChart data={base.forecast} compare={sim.forecast} floor={sim.safetyFloor} height={260} />
        </Card>

        <Card>
          <CardTitle hint="Chance of reaching each goal on time (300-path simulation)">Goal impact</CardTitle>
          <ul className="divide-y divide-slate-100">
            {sim.goals.map((g, i) => {
              const b = base.goals[i];
              const delta = g.probability - b.probability;
              return (
                <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{g.name}</p>
                    <p className="text-xs text-slate-500">ETA {g.etaDate ? fmtDate(g.etaDate, { month: "short", year: "numeric" }) : "beyond 50 years"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="num text-sm text-slate-400">{pct(b.probability)}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                    <span className="num text-lg font-semibold text-slate-900">{pct(g.probability)}</span>
                    <span className={cn("w-14 text-right text-xs font-semibold", Math.abs(delta) < 0.005 ? "text-slate-400" : delta > 0 ? "text-emerald-600" : "text-rose-600")}>
                      {Math.abs(delta) < 0.005 ? "–" : `${delta > 0 ? "+" : ""}${Math.round(delta * 100)} pts`}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
