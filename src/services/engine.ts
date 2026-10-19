/**
 * WealthTwin engine — pure, deterministic, explainable.
 * Every number on screen is derived here from a persona's synthetic inputs.
 * Runs identically on the server and in the browser (used by the simulator).
 */
import type {
  AssetClass, Factor, Goal, Holding, Insight, Overrides, Persona, PersonaId,
  RebalanceMove, Recommendation, RiskLevel, SpendSlice, TwinState, ForecastPoint, HistoryPoint,
} from "@/types/twin";
import { PERSONAS } from "./personas";
import { inr, pct, fmtDate } from "@/lib/utils";

const FORECAST_DAYS = 90;

/* ---------- deterministic randomness ---------- */
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashRand = (seed: number, n: number) => mulberry32(seed * 100003 + n * 7919)();
function gauss(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/* ---------- date helpers ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const monthsBetween = (a: Date, b: Date) => (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
const epochDay = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ---------- goal maths ---------- */
export function monthsToTarget(current: number, monthly: number, annualReturn: number, target: number, cap = 600): number | null {
  if (current >= target) return 0;
  const i = annualReturn / 12;
  let b = current;
  for (let m = 1; m <= cap; m++) {
    b = b * (1 + i) + monthly;
    if (b >= target) return m;
  }
  return null;
}

export function requiredMonthly(current: number, target: number, annualReturn: number, months: number): number {
  if (current >= target) return 0;
  if (months <= 0) return target - current;
  const i = annualReturn / 12;
  const g = Math.pow(1 + i, months);
  if (i === 0) return (target - current) / months;
  return Math.max(0, ((target - current * g) * i) / (g - 1));
}

export function goalProbability(current: number, monthly: number, annualReturn: number, vol: number, target: number, months: number, seed: number, paths = 300): number {
  if (current >= target) return 1;
  if (months <= 0) return 0;
  const n = Math.min(months, 360);
  const rand = mulberry32(seed);
  const mu = annualReturn / 12 - (vol * vol) / 24;
  const sd = vol / Math.sqrt(12);
  let hit = 0;
  for (let p = 0; p < paths; p++) {
    let b = current;
    for (let m = 0; m < n; m++) b = b * (1 + mu + sd * gauss(rand)) + monthly;
    if (b >= target) hit++;
  }
  return hit / paths;
}

/* ---------- builder ---------- */
export function buildTwin(personaId: PersonaId, overrides: Overrides = {}, asOfIso?: string): TwinState {
  const persona: Persona = PERSONAS[personaId];
  const asOfDate = startOfDay(asOfIso ? new Date(asOfIso + "T00:00:00") : new Date());
  const o = {
    extraSip: Math.max(-persona.goals.reduce((a, g) => a + g.monthly, 0) * 0.6, overrides.extraSip ?? 0),
    expenseCut: clamp((overrides.expenseCutPct ?? 0) / 100, 0, 0.5),
    incomeMult: 1 + clamp((overrides.incomeChangePct ?? 0) / 100, -0.6, 1),
    shock: Math.max(0, overrides.oneTimeShock ?? 0),
    marketDrop: clamp((overrides.marketDropPct ?? 0) / 100, 0, 0.6),
    equityReturn: overrides.equityReturn,
  };

  const baseIncome = persona.monthlyIncome * o.incomeMult;
  const variable = persona.variableSpend * (1 - o.expenseCut);
  const billsTotal = persona.bills.reduce((s, b) => s + b.amount, 0);
  const emiTotal = persona.bills.filter((b) => b.category === "emi").reduce((s, b) => s + b.amount, 0);
  const sipBase = persona.goals.reduce((s, g) => s + g.monthly, 0);
  const sipTotal = sipBase + o.extraSip;
  const monthlyExpense = billsTotal + variable;

  /* history (6 months) */
  const history: HistoryPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = addMonths(asOfDate, -i);
    const r1 = hashRand(persona.seed, epochDay(d) + 1);
    const r2 = hashRand(persona.seed, epochDay(d) + 2);
    const income = Math.round(baseIncome * (1 + persona.incomeVolatility * (r1 * 2 - 1)));
    const expense = Math.round(billsTotal + variable * (1 + 0.09 * (r2 * 2 - 1)));
    history.push({ month: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, income, expense, net: income - expense });
  }
  const monthlyIncome = history.reduce((s, h) => s + h.income, 0) / history.length;
  const avgExpense = history.reduce((s, h) => s + h.expense, 0) / history.length;
  const monthlySurplus = monthlyIncome - avgExpense;
  const savingsRate = clamp(monthlySurplus / monthlyIncome, -1, 1);

  /* portfolio */
  const holdings0 = persona.holdings.map((h) => {
    let ret = h.expectedReturn;
    if (h.assetClass === "equity" && o.equityReturn !== undefined) ret = o.equityReturn + (h.expectedReturn - 0.115);
    const value = h.assetClass === "equity" ? h.value * (1 - o.marketDrop) : h.value;
    return { ...h, value, expectedReturn: ret };
  });
  const invested = holdings0.reduce((s, h) => s + h.value, 0);
  const holdings: Holding[] = holdings0.map((h) => ({ ...h, allocation: h.value / invested }));
  const share = (c: AssetClass) => holdings.filter((h) => h.assetClass === c).reduce((s, h) => s + h.allocation, 0);
  const equityShare = share("equity");
  const targetEquityShare = clamp((110 - persona.age) / 100, 0.3, 0.75);
  const volProxy = holdings.reduce((s, h) => s + h.allocation * h.volatility, 0) * 0.85;
  const portfolioReturn = holdings.reduce((s, h) => s + h.allocation * h.expectedReturn, 0);
  const portfolioRisk: RiskLevel = volProxy < 0.08 ? "low" : volProxy < 0.13 ? "medium" : "high";
  const maxAlloc = Math.max(...holdings.map((h) => h.allocation));

  const rebalance: RebalanceMove[] = [];
  const nonEquity = 1 - equityShare;
  const targets: Record<AssetClass, number> = {
    equity: targetEquityShare,
    debt: (1 - targetEquityShare) * 0.55,
    gold: (1 - targetEquityShare) * 0.2,
    cash: (1 - targetEquityShare) * 0.25,
  };
  void nonEquity;
  (Object.keys(targets) as AssetClass[]).forEach((c) => {
    const cur = share(c);
    if (Math.abs(cur - targets[c]) >= 0.06) {
      rebalance.push({ assetClass: c, currentShare: cur, targetShare: targets[c], amount: Math.round((targets[c] - cur) * invested) });
    }
  });

  /* liquidity */
  const cashHoldings = holdings.filter((h) => h.assetClass === "cash").reduce((s, h) => s + h.value, 0);
  const startCash = Math.max(0, persona.cash - o.shock);
  const liquid = startCash + cashHoldings;
  const emergencyMonths = liquid / monthlyExpense;
  const netWorth = invested + startCash;

  /* 90-day forecast */
  const dailyVar = variable / 30;
  const incomeEvents = (d: Date): number => {
    if (persona.incomeType === "salaried") return d.getDate() === persona.incomeDay ? baseIncome : 0;
    const r = hashRand(persona.seed, epochDay(d) + 900);
    if (r > 2.5 / 30) return 0;
    const u = hashRand(persona.seed, epochDay(d) + 1700);
    return (baseIncome / 2.5) * (1 + 0.6 * (u * 2 - 1));
  };
  const pessInc = 1 - 0.5 * persona.incomeVolatility - 0.05;
  let bal = startCash, balLow = startCash, balHigh = startCash;
  const forecast: ForecastPoint[] = [];
  for (let i = 0; i < FORECAST_DAYS; i++) {
    const d = addDays(asOfDate, i + 1);
    const events: string[] = [];
    let inc = incomeEvents(d);
    if (inc > 0) events.push(`Income ${inr(inc, true)}`);
    let out = 0;
    for (const b of persona.bills) if (b.day === d.getDate()) { out += b.amount; events.push(`${b.name} ${inr(b.amount, true)}`); }
    if (d.getDate() === 5) { out += sipTotal; events.push(`SIP ${inr(sipTotal, true)}`); }
    if (i === 6 && o.shock > 0) events.push(`One-time expense ${inr(o.shock, true)} (already deducted)`);
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 6 ? 1.3 : 1;
    const noise = 1 + 0.3 * (hashRand(persona.seed, epochDay(d) + 300) * 2 - 1);
    const dv = (dailyVar * weekend * noise) / 1.086;
    bal += inc - out - dv;
    balLow += inc * pessInc - out - dv * 1.2;
    balHigh += inc * 1.04 - out - dv * 0.92;
    inc = 0;
    forecast.push({
      date: toIso(d),
      expected: Math.round(bal),
      low: Math.round(Math.min(balLow, bal)),
      high: Math.round(Math.max(balHigh, bal)),
      band: [Math.round(Math.min(balLow, bal)), Math.round(Math.max(balHigh, bal))],
      events,
    });
  }
  const safetyFloor = Math.round((avgExpense / 30) * 10);
  const minPoint = forecast.reduce((m, p) => (p.expected < m.expected ? p : m), forecast[0]);
  const pessimisticMin = Math.min(...forecast.map((p) => p.low));
  const below = forecast.filter((p) => p.expected < safetyFloor);
  const stress = {
    minBalance: minPoint.expected,
    minDate: minPoint.date,
    pessimisticMin,
    daysBelowFloor: below.length,
    firstStressDate: below.length ? below[0].date : null,
  };
  const cashflowHealth: RiskLevel =
    stress.minBalance < safetyFloor || pessimisticMin < 0 ? "high" : pessimisticMin < safetyFloor ? "medium" : "low";

  /* spending */
  const byCat = (c: string) => persona.bills.filter((b) => b.category === c).reduce((s, b) => s + b.amount, 0);
  const spendingAll: SpendSlice[] = [
    { category: "Housing", amount: byCat("housing") },
    { category: "Loan EMIs", amount: byCat("emi") },
    { category: "Education", amount: byCat("education") },
    { category: "Utilities", amount: byCat("utilities") },
    { category: "Insurance", amount: byCat("insurance") },
    { category: "Subscriptions", amount: byCat("subscription") },
    { category: "Food & dining", amount: Math.round(variable * 0.42) },
    { category: "Transport", amount: Math.round(variable * 0.18) },
    { category: "Shopping & lifestyle", amount: Math.round(variable * 0.4) },
  ];
  const spending = spendingAll.filter((s) => s.amount > 0).sort((a, b) => b.amount - a.amount);

  /* goals */
  const goals: Goal[] = persona.goals.map((g, idx) => {
    const emergency = g.kind === "emergency";
    const current = emergency ? liquid : g.currentAmount;
    const monthly = Math.max(0, g.monthly + (g.id === "g2" ? o.extraSip : 0));
    const ret = emergency ? 0.065 : portfolioReturn;
    const vol = emergency ? 0.005 : volProxy;
    const target = new Date(g.targetDate + "T00:00:00");
    const monthsLeft = Math.max(0, monthsBetween(asOfDate, target));
    const m = monthsToTarget(current, monthly, ret, g.targetAmount);
    const eta = m === null ? null : toIso(addMonths(asOfDate, m));
    return {
      ...g, currentAmount: current, monthly,
      progress: clamp(current / g.targetAmount, 0, 1),
      expectedReturn: ret, volatility: vol,
      etaDate: eta,
      onTrack: m !== null && m <= monthsLeft,
      probability: goalProbability(current, monthly, ret, vol, g.targetAmount, monthsLeft, persona.seed + idx),
      requiredMonthly: requiredMonthly(current, g.targetAmount, ret, monthsLeft),
    };
  });

  /* 5-year net worth projection */
  const projection = Array.from({ length: 6 }, (_, y) => {
    const grow = (r: number) => {
      const i = r / 12;
      const n = y * 12;
      const g = Math.pow(1 + i, n);
      return invested * g + (i === 0 ? sipTotal * n : sipTotal * ((g - 1) / i)) + startCash;
    };
    return { year: asOfDate.getFullYear() + y, base: Math.round(grow(portfolioReturn)), downside: Math.round(grow(portfolioReturn - volProxy * 0.8)) };
  });

  /* health score */
  const rateP = clamp(savingsRate / 0.3, 0, 1) * 25;
  const runwayP = clamp(emergencyMonths / 6, 0, 1) * 25;
  const debtRatio = emiTotal / monthlyIncome;
  const debtP = (1 - clamp((debtRatio - 0.15) / 0.35, 0, 1)) * 15;
  const drift = Math.abs(equityShare - targetEquityShare);
  const divP = Math.max(0, (1 - clamp(drift / 0.35, 0, 1)) * 15 - (maxAlloc > 0.45 ? 3 : 0));
  const stabP = cashflowHealth === "low" ? 20 : cashflowHealth === "medium" ? 11 : 3;
  const mk = (id: string, label: string, points: number, max: number, detail: string): Factor => ({
    id, label, points: Math.round(points * 10) / 10, max, detail,
    impact: points / max >= 0.7 ? "positive" : points / max < 0.45 ? "negative" : "neutral",
  });
  const factors: Factor[] = [
    mk("rate", "Savings rate", rateP, 25, `You keep ${pct(savingsRate)} of income; 30% earns full marks.`),
    mk("runway", "Emergency runway", runwayP, 25, `${emergencyMonths.toFixed(1)} months of expenses are liquid; 6 months earns full marks.`),
    mk("stability", "90-day cashflow stability", stabP, 20, cashflowHealth === "low" ? "Balance stays above your safety floor, even in the pessimistic case." : cashflowHealth === "medium" ? "Pessimistic case dips below your safety floor." : "Projected balance dips below your safety floor."),
    mk("debt", "Debt burden", debtP, 15, `EMIs take ${pct(debtRatio)} of income; under 15% is full marks.`),
    mk("mix", "Portfolio fit", divP, 15, `${pct(equityShare)} equity vs ${pct(targetEquityShare)} suggested for age ${persona.age}${maxAlloc > 0.45 ? "; one holding exceeds 45%" : ""}.`),
  ];
  const score = Math.round(factors.reduce((s, f) => s + f.points, 0));
  const grade = score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 50 ? "Fair" : "Needs attention";

  /* insights */
  const insights: Insight[] = [];
  if (cashflowHealth !== "low") {
    insights.push({
      id: "i-stress", severity: cashflowHealth, category: "cashflow", href: "/forecast",
      title: stress.firstStressDate ? `Cash may run thin around ${fmtDate(stress.firstStressDate)}` : "Downside scenario shows a cash squeeze",
      body: stress.firstStressDate
        ? `Projected balance falls below your ${inr(safetyFloor)} safety floor on ${stress.daysBelowFloor} day(s), bottoming at ${inr(stress.minBalance)} on ${fmtDate(stress.minDate)}.`
        : `If income lands 20% lower than planned, balance could drop to ${inr(pessimisticMin)}.`,
    });
  } else {
    insights.push({
      id: "i-ok", severity: "low", category: "cashflow", href: "/forecast",
      title: "Next 90 days look comfortable",
      body: `Lowest projected balance is ${inr(stress.minBalance)} on ${fmtDate(stress.minDate)}, above your ${inr(safetyFloor)} floor.`,
    });
  }
  if (emergencyMonths < 3) {
    insights.push({
      id: "i-runway", severity: emergencyMonths < 2 ? "high" : "medium", category: "goals", href: "/goals",
      title: `Emergency runway is ${emergencyMonths.toFixed(1)} months`,
      body: `Liquid assets cover ${emergencyMonths.toFixed(1)} months of spending. Most planners recommend 3 to 6.`,
    });
  }
  if (Math.abs(equityShare - targetEquityShare) >= 0.08) {
    const over = equityShare > targetEquityShare;
    insights.push({
      id: "i-mix", severity: Math.abs(equityShare - targetEquityShare) > 0.2 ? "high" : "medium", category: "portfolio", href: "/portfolio",
      title: over ? "Equity share is above your suggested mix" : "Equity share is below your suggested mix",
      body: `${pct(equityShare)} in equity against ${pct(targetEquityShare)} suggested at age ${persona.age}.`,
    });
  }
  const off = goals.filter((g) => !g.onTrack);
  if (off.length) {
    insights.push({
      id: "i-goal", severity: "medium", category: "goals", href: "/goals",
      title: `${off.length} goal${off.length > 1 ? "s are" : " is"} behind schedule`,
      body: `${off[0].name} needs ${inr(off[0].requiredMonthly)}/month to land on time; you contribute ${inr(off[0].monthly)}.`,
    });
  }
  const subs = byCat("subscription");
  if (subs / monthlyIncome > 0.04) {
    insights.push({
      id: "i-subs", severity: "low", category: "spending", href: "/dashboard",
      title: "Subscriptions are a noticeable slice",
      body: `${inr(subs)}/month (${pct(subs / monthlyIncome, 1)} of income). A quarterly audit often frees 20 to 30%.`,
    });
  }

  /* recommendations */
  const recommendations: Recommendation[] = [];
  const sweep = Math.max(2000, Math.round(Math.max(0, monthlySurplus - sipTotal) * 0.5 / 500) * 500);
  if (emergencyMonths < 6) {
    recommendations.push({
      id: "r-sweep", title: `Auto-sweep ${inr(sweep)} a month into a liquid fund`,
      description: "Moves spare cash into a high-liquidity bucket so the buffer grows without touching your lifestyle.",
      impact: `Test it in the simulator`, href: "/simulator", cta: "Simulate",
    });
  }
  if (rebalance.length) {
    const eq = rebalance.find((m) => m.assetClass === "equity");
    recommendations.push({
      id: "r-rebal", title: eq ? `${eq.amount < 0 ? "Trim" : "Add"} about ${inr(Math.abs(eq.amount), true)} ${eq.amount < 0 ? "of" : "to"} equity` : "Rebalance toward your target mix",
      description: "Brings your allocation back toward a mix that fits your age and stated risk tolerance.",
      impact: "Lower drawdown risk", href: "/portfolio", cta: "View plan",
    });
  }
  if (off.length) {
    recommendations.push({
      id: "r-goal", title: `Close the gap on ${off[0].name}`,
      description: `Raising the monthly contribution to ${inr(Math.ceil(off[0].requiredMonthly / 500) * 500)} puts it back on schedule.`,
      impact: `Currently ${pct(off[0].probability)} likely`, href: "/goals", cta: "See goals",
    });
  }
  recommendations.push({
    id: "r-learn", title: "Understand the numbers behind your score",
    description: "Three-minute lessons that use your own figures, not textbook examples.",
    impact: "Financial literacy", href: "/learn", cta: "Start learning",
  });

  return {
    persona, asOf: toIso(asOfDate), currency: "INR",
    score, grade, factors, cashflowHealth, portfolioRisk,
    monthlyIncome, monthlyExpense: avgExpense, monthlySurplus, savingsRate,
    emergencyMonths, liquid, invested, netWorth,
    history, forecast, safetyFloor, stress, spending,
    holdings, equityShare, targetEquityShare, rebalance, goals, projection,
    insights, recommendations, isSynthetic: true,
  };
}

export const todayIso = () => toIso(new Date());
