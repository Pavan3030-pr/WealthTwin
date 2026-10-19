import type { PersonaId, TwinState } from "@/types/twin";
import { buildTwin } from "./engine";
import { inr, pct, fmtDate } from "@/lib/utils";

export interface CopilotAnswer {
  answer: string;
  basis: string[];
  followUps: string[];
}

function parseAmount(q: string): number | null {
  const m = q.toLowerCase().replace(/,/g, "").match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k|l|lakh|lakhs|cr|crore)?/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  const u = m[2];
  if (u === "k") n *= 1e3;
  else if (u === "l" || u === "lakh" || u === "lakhs") n *= 1e5;
  else if (u === "cr" || u === "crore") n *= 1e7;
  return n >= 500 ? n : null;
}

export function twinSummary(t: TwinState) {
  return {
    name: t.persona.name, age: t.persona.age, role: t.persona.role,
    healthScore: t.score, grade: t.grade,
    monthlyIncome: Math.round(t.monthlyIncome), monthlyExpense: Math.round(t.monthlyExpense),
    savingsRate: pct(t.savingsRate), emergencyRunwayMonths: +t.emergencyMonths.toFixed(1),
    safetyFloor: t.safetyFloor, lowestProjectedBalance: t.stress.minBalance, lowestBalanceDate: t.stress.minDate,
    daysBelowFloor: t.stress.daysBelowFloor, equityShare: pct(t.equityShare), suggestedEquityShare: pct(t.targetEquityShare),
    goals: t.goals.map((g) => ({ name: g.name, progress: pct(g.progress), onTrack: g.onTrack, probability: pct(g.probability), requiredMonthly: Math.round(g.requiredMonthly) })),
    topFactors: t.factors.map((f) => `${f.label}: ${f.points}/${f.max}`),
  };
}

export function answerWithEngine(personaId: PersonaId, question: string, asOf?: string): CopilotAnswer {
  const t = buildTwin(personaId, {}, asOf);
  const q = question.toLowerCase();
  const amount = parseAmount(q);

  if (/afford|buy|purchase|spend|trip|phone|laptop|wedding|expense of/.test(q) && amount) {
    const after = buildTwin(personaId, { oneTimeShock: amount }, asOf);
    const safe = after.stress.minBalance >= after.safetyFloor && after.stress.pessimisticMin >= 0;
    return {
      answer: safe
        ? `Yes, ${inr(amount)} fits. Your lowest projected balance would be ${inr(after.stress.minBalance)} on ${fmtDate(after.stress.minDate)}, still above your ${inr(after.safetyFloor)} safety floor. Your health score moves from ${t.score} to ${after.score}.`
        : `I would pause. Spending ${inr(amount)} now pushes your lowest projected balance to ${inr(after.stress.minBalance)} on ${fmtDate(after.stress.minDate)}, below your ${inr(after.safetyFloor)} safety floor${after.stress.pessimisticMin < 0 ? ", and the downside case goes negative" : ""}. Spreading it over a few months or waiting for the next income date would keep you safe.`,
      basis: ["90-day cashflow forecast", "Safety floor (10 days of spending)", "Health score model"],
      followUps: ["What is my biggest financial risk?", "How do I build my emergency fund faster?"],
    };
  }
  if (/runway|emergency|buffer|rainy/.test(q)) {
    const g = t.goals.find((x) => x.kind === "emergency")!;
    return {
      answer: `You hold ${inr(t.liquid)} in liquid assets, which covers ${t.emergencyMonths.toFixed(1)} months of spending. Target is 6 months (${inr(g.targetAmount)}). At ${inr(g.monthly)}/month you reach it around ${g.etaDate ? fmtDate(g.etaDate, { month: "short", year: "numeric" }) : "later than 50 years out"}. Adding ${inr(Math.ceil(Math.max(0, g.requiredMonthly - g.monthly) / 500) * 500 || 2000)}/month keeps the original date.`,
      basis: ["Liquid assets", "Average monthly spending", "Emergency goal projection"],
      followUps: ["Can I afford a ₹50,000 purchase?", "Show me my cashflow risk"],
    };
  }
  if (/stress|cash ?flow|forecast|run out|shortfall|low balance|balance/.test(q)) {
    return {
      answer: t.stress.firstStressDate
        ? `Your balance is projected to dip below the ${inr(t.safetyFloor)} safety floor from ${fmtDate(t.stress.firstStressDate)}, bottoming at ${inr(t.stress.minBalance)} on ${fmtDate(t.stress.minDate)}. In the downside case it reaches ${inr(t.stress.pessimisticMin)}. Moving large discretionary spends after your next income date is the cleanest fix.`
        : `Your next 90 days look comfortable. The lowest projected balance is ${inr(t.stress.minBalance)} on ${fmtDate(t.stress.minDate)}. Even if income lands lower than planned, the downside low is ${inr(t.stress.pessimisticMin)}.`,
      basis: ["90-day forecast", "Pessimistic and optimistic bands", "Safety floor"],
      followUps: ["Can I afford a ₹30,000 purchase?", "What is my health score made of?"],
    };
  }
  if (/portfolio|invest|rebalanc|equity|stock|mutual|allocation|risk/.test(q)) {
    const eq = t.rebalance.find((m) => m.assetClass === "equity");
    return {
      answer: `Your portfolio is ${pct(t.equityShare)} equity against ${pct(t.targetEquityShare)} suggested for age ${t.persona.age}, with ${t.portfolioRisk === "low" ? "low" : t.portfolioRisk === "medium" ? "moderate" : "high"} overall volatility. ${eq ? `A ${eq.amount > 0 ? "top-up" : "trim"} of about ${inr(Math.abs(eq.amount), true)} in equity would close the gap, ideally through new SIPs instead of selling.` : "You are close to target, so keep contributing as planned."} Educational guidance only, not investment advice.`,
      basis: ["Holdings", "Age-based target mix", "Volatility proxy"],
      followUps: ["How is my goal progress?", "What if markets fall 20%?"],
    };
  }
  if (/goal|retire|house|home|education|target|on track/.test(q)) {
    const lines = t.goals.map((g) => `${g.name}: ${pct(g.progress)} funded, ${pct(g.probability)} chance of landing on time${g.onTrack ? "" : `, needs ${inr(Math.ceil(g.requiredMonthly / 500) * 500)}/month`}`);
    return { answer: lines.join(". ") + ".", basis: ["Goal projections", "300-path Monte Carlo"], followUps: ["Can I afford a ₹40,000 purchase?", "How do I raise my score?"] };
  }
  if (/score|health|improve|raise|why|explain/.test(q)) {
    const worst = [...t.factors].sort((a, b) => a.points / a.max - b.points / b.max)[0];
    return {
      answer: `Your score is ${t.score}/100 (${t.grade}). The biggest drag is ${worst.label.toLowerCase()} at ${worst.points}/${worst.max}: ${worst.detail} Improving that one factor is the fastest way to move the score.`,
      basis: t.factors.map((f) => `${f.label} ${f.points}/${f.max}`),
      followUps: ["How do I build my emergency fund faster?", "Show me my cashflow risk"],
    };
  }
  if (/sav|budget|spend|cut|expens/.test(q)) {
    const top = t.spending.slice(0, 3).map((s) => `${s.category} ${inr(s.amount)}`).join(", ");
    return {
      answer: `You keep ${pct(t.savingsRate)} of income (${inr(t.monthlySurplus)}/month). Your biggest spending categories are ${top}. Trimming discretionary spend by 10% frees about ${inr(Math.round(t.monthlyExpense * 0.1 * 0.58))} a month; try it in the simulator.`,
      basis: ["6-month history", "Spending breakdown"],
      followUps: ["What is my emergency runway?", "Can I afford a ₹25,000 purchase?"],
    };
  }
  return {
    answer: `Here is where you stand: health score ${t.score}/100 (${t.grade}), ${t.emergencyMonths.toFixed(1)} months of runway, ${pct(t.savingsRate)} savings rate, and ${t.cashflowHealth === "low" ? "a calm" : "a tight"} next 90 days. Ask me about cashflow, goals, your portfolio, or whether you can afford a specific purchase.`,
    basis: ["Twin summary"],
    followUps: ["Can I afford a ₹30,000 purchase?", "How do I raise my score?", "What is my emergency runway?"],
  };
}

export const SUGGESTED_QUESTIONS = [
  "Can I afford a ₹40,000 phone this month?",
  "Will my cash run low in the next 90 days?",
  "How do I raise my health score?",
  "Am I on track for my goals?",
];
