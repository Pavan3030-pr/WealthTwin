/** Decision layer on top of the twin: what to do next, safe-to-spend, adaptive SIP, fitness level. */
import type { TwinState } from "@/types/twin";
import { buildTwin } from "./engine";
import { fmtDate, inr, pct } from "@/lib/utils";

export interface NextAction {
  tone: "alert" | "focus" | "good";
  eyebrow: string;
  title: string;
  body: string;
  stat?: { label: string; from: string; to: string };
  href: string;
  cta: string;
}

export function nextBestAction(t: TwinState): NextAction {
  const id = t.persona.id;
  if (t.cashflowHealth !== "low") {
    const sim = buildTwin(id, { expenseCutPct: 15 }, t.asOf);
    return {
      tone: "alert", eyebrow: "Needs attention",
      title: t.stress.firstStressDate ? `Protect the cash dip around ${fmtDate(t.stress.minDate)}` : "Build slack before a weak income month",
      body: `Your balance is projected to bottom at ${inr(t.stress.minBalance)}, against a ${inr(t.safetyFloor)} safety floor. Trimming flexible spending by 15% for the next quarter is the lightest fix.`,
      stat: { label: "Lowest balance", from: inr(t.stress.minBalance, true), to: inr(sim.stress.minBalance, true) },
      href: "/simulator", cta: "Test this in the simulator",
    };
  }
  if (t.emergencyMonths < 4) {
    const sim = buildTwin(id, { expenseCutPct: 10 }, t.asOf);
    const g = t.goals.find((x) => x.kind === "emergency")!;
    return {
      tone: "focus", eyebrow: "Biggest lever",
      title: "Lift your emergency runway first",
      body: `You can cover ${t.emergencyMonths.toFixed(1)} months of spending. Six months is the usual target (${inr(g.targetAmount, true)}). Redirecting a slice of flexible spend closes the gap faster.`,
      stat: { label: "Runway", from: `${t.emergencyMonths.toFixed(1)} mo`, to: `${sim.emergencyMonths.toFixed(1)} mo` },
      href: "/goals", cta: "See the goal plan",
    };
  }
  const behind = t.goals.find((g) => !g.onTrack);
  if (behind) {
    const need = Math.ceil(behind.requiredMonthly / 500) * 500;
    const sim = buildTwin(id, { extraSip: Math.max(0, need - behind.monthly) }, t.asOf);
    const after = sim.goals.find((g) => g.id === behind.id)!;
    return {
      tone: "focus", eyebrow: "Biggest lever",
      title: `Put ${behind.name} back on schedule`,
      body: `It needs about ${inr(need)} a month to land on time; you contribute ${inr(behind.monthly)}.`,
      stat: { label: "Chance on time", from: pct(behind.probability), to: pct(after.probability) },
      href: "/simulator", cta: "Simulate the change",
    };
  }
  return {
    tone: "good", eyebrow: "All clear",
    title: "Your twin is on track",
    body: "Cashflow, runway and goals are healthy. Keep contributions steady and review your mix each quarter.",
    href: "/learn", cta: "Keep learning",
  };
}

export function safeToSpend(t: TwinState) {
  const horizon = t.forecast.slice(0, 30);
  const minExp = Math.min(...horizon.map((p) => p.expected));
  const headroom = Math.max(0, Math.round((minExp - t.safetyFloor) / 100) * 100);
  return { headroom, perDay: Math.round(headroom / 30 / 50) * 50, minBalance90: t.stress.minBalance, floor: t.safetyFloor };
}

export interface AdaptiveSip { current: number; suggested: number; tone: "reduce" | "hold" | "raise"; reason: string; effect?: string }

export function adaptiveSip(t: TwinState): AdaptiveSip {
  const current = t.goals.reduce((s, g) => s + g.monthly, 0);
  const free = t.monthlySurplus - current;
  const id = t.persona.id;
  if (t.cashflowHealth === "high") {
    const suggested = Math.round((current * 0.7) / 500) * 500;
    const sim = buildTwin(id, { extraSip: suggested - current }, t.asOf);
    return { current, suggested, tone: "reduce", reason: "Cash is projected to dip below your safety floor. A temporary 30% SIP reduction protects liquidity until income recovers.", effect: `Lowest balance ${inr(t.stress.minBalance, true)} → ${inr(sim.stress.minBalance, true)}` };
  }
  if (t.cashflowHealth === "low" && free > t.monthlyIncome * 0.03) {
    const bump = Math.floor((free * 0.5) / 500) * 500;
    if (bump >= 500) {
      const sim = buildTwin(id, { extraSip: bump }, t.asOf);
      return { current, suggested: current + bump, tone: "raise", reason: "You have spare cash and a calm 90-day outlook. Investing half of it keeps a cushion while compounding earlier.", effect: `Still above floor: lowest balance ${inr(sim.stress.minBalance, true)}` };
    }
  }
  return { current, suggested: current, tone: "hold", reason: "Your SIP fits comfortably within your projected cashflow. No change needed this month." };
}

export interface Badge { id: string; label: string; hint: string; earned: boolean }

export function fitness(t: TwinState) {
  const emi = t.persona.bills.filter((b) => b.category === "emi").reduce((s, b) => s + b.amount, 0) / t.monthlyIncome;
  const badges: Badge[] = [
    { id: "buffer", label: "Buffer Builder", hint: "3+ months of runway", earned: t.emergencyMonths >= 3 },
    { id: "saver", label: "Steady Saver", hint: "Save 20%+ of income", earned: t.savingsRate >= 0.2 },
    { id: "calm", label: "Calm Cashflow", hint: "No stress in 90 days", earned: t.cashflowHealth === "low" },
    { id: "light", label: "Debt Light", hint: "EMIs under 25% of income", earned: emi < 0.25 },
    { id: "mix", label: "Well Mixed", hint: "Within 8 pts of target equity", earned: Math.abs(t.equityShare - t.targetEquityShare) < 0.08 },
    { id: "track", label: "On Track", hint: "Every goal on schedule", earned: t.goals.every((g) => g.onTrack) },
  ];
  const levels = [
    { name: "Seedling", min: 0 }, { name: "Sprout", min: 50 }, { name: "Grower", min: 65 }, { name: "Compounder", min: 80 },
  ];
  const idx = levels.reduce((a, l, i) => (t.score >= l.min ? i : a), 0);
  const next = levels[idx + 1];
  return {
    level: levels[idx].name,
    next: next ? next.name : null,
    toNext: next ? Math.max(0, next.min - t.score) : 0,
    progress: next ? (t.score - levels[idx].min) / (next.min - levels[idx].min) : 1,
    badges,
  };
}

export function briefing(t: TwinState): string {
  const first = t.persona.name.split(" ")[0];
  const stress = t.cashflowHealth === "low" ? "your next 90 days look calm" : t.stress.firstStressDate ? `cash may run thin around ${fmtDate(t.stress.firstStressDate)}` : "a downside case could squeeze cash";
  return `${first}, ${stress}. You keep ${pct(t.savingsRate)} of income and hold ${t.emergencyMonths.toFixed(1)} months of runway.`;
}
