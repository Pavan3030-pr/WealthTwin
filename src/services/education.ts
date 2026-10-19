import type { TwinState } from "@/types/twin";
import { inr, pct } from "@/lib/utils";

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  level: "Beginner" | "Intermediate";
  summary: string;
  body: string[];
  yourNumbers: string;
  quiz: { question: string; options: string[]; answer: number; explain: string };
}

export function buildLessons(t: TwinState): Lesson[] {
  const emergency = t.goals.find((g) => g.kind === "emergency")!;
  const growth = t.goals.find((g) => g.kind === "growth")!;
  return [
    {
      id: "emergency", title: "Why 6 months of runway matters", minutes: 3, level: "Beginner",
      summary: "The single biggest protector against forced borrowing.",
      body: [
        "An emergency fund is money you can reach in a day without selling investments at a loss. Job loss, medical bills and repairs rarely arrive one at a time.",
        "The usual target is three to six months of essential spending. Freelancers and single-income families should lean toward six or more.",
      ],
      yourNumbers: `You hold ${inr(t.liquid)} liquid, about ${t.emergencyMonths.toFixed(1)} months of your ${inr(t.monthlyExpense)} monthly spending. Target: ${inr(emergency.targetAmount)}.`,
      quiz: { question: "Which is the best home for an emergency fund?", options: ["Small-cap mutual fund", "Liquid fund or savings account", "Locked 5-year deposit"], answer: 1, explain: "It must be stable and reachable within a day. Volatile or locked assets defeat the purpose." },
    },
    {
      id: "savings-rate", title: "Savings rate: the number that compounds", minutes: 3, level: "Beginner",
      summary: "How much of each rupee you keep decides everything downstream.",
      body: [
        "Savings rate is (income minus spending) divided by income. It matters more than chasing returns early in your career.",
        "A common benchmark is 20 to 30%. Raising it by five points often beats picking a slightly better fund.",
      ],
      yourNumbers: `Your savings rate is ${pct(t.savingsRate)}, or ${inr(t.monthlySurplus)} a month. Each extra 5 points is about ${inr(t.monthlyIncome * 0.05)} a month.`,
      quiz: { question: "Income ₹1,00,000, spending ₹75,000. Savings rate?", options: ["15%", "25%", "75%"], answer: 1, explain: "(100,000 − 75,000) ÷ 100,000 = 25%." },
    },
    {
      id: "compounding", title: "SIPs and the cost of waiting", minutes: 4, level: "Beginner",
      summary: "Why starting a small SIP early beats a large one later.",
      body: [
        "A SIP invests a fixed amount every month, buying more units when prices are low and fewer when high. It builds the habit and smooths entry price.",
        "Compounding rewards time more than amount. A rupee invested at 26 has far longer to grow than one invested at 36.",
      ],
      yourNumbers: `You invest ${inr(t.goals.reduce((s, g) => s + g.monthly, 0))} a month across goals. At an expected ${pct(growth.expectedReturn, 1)} a year, ${growth.name} reaches ${inr(growth.targetAmount, true)} around ${growth.etaDate ? new Date(growth.etaDate).getFullYear() : "never at this pace"}.`,
      quiz: { question: "What matters most for long-term compounding?", options: ["Time in the market", "Timing the bottom", "Checking daily"], answer: 0, explain: "Time lets returns earn returns. Market timing consistently underperforms for most investors." },
    },
    {
      id: "allocation", title: "Asset allocation and rebalancing", minutes: 4, level: "Intermediate",
      summary: "Your mix drives risk more than any single pick.",
      body: [
        "Allocation is how your money splits between equity, debt, gold and cash. Equity grows faster but swings harder.",
        "Rebalancing returns you to your target mix. Using new contributions avoids selling and tax drag.",
      ],
      yourNumbers: `You are ${pct(t.equityShare)} equity; a common age-based guide suggests ${pct(t.targetEquityShare)}. Overall volatility reads ${t.portfolioRisk}.`,
      quiz: { question: "Cheapest way to rebalance?", options: ["Sell winners immediately", "Direct new SIPs to the underweight asset", "Move everything to cash"], answer: 1, explain: "Redirecting fresh contributions rebalances without trading costs or taxes." },
    },
    {
      id: "uncertainty", title: "Probability, not promises", minutes: 4, level: "Intermediate",
      summary: "What a 70% chance of reaching a goal actually means.",
      body: [
        "Markets do not return a smooth average. WealthTwin runs 300 random return paths for each goal and counts how many reach the target on time.",
        "Seventy per cent does not mean it will happen; it means 7 of 10 plausible futures succeed. Raising contributions or extending the date moves the odds.",
      ],
      yourNumbers: `${growth.name} currently has a ${pct(growth.probability)} chance of landing on time${growth.onTrack ? "" : `; ${inr(Math.ceil(growth.requiredMonthly / 500) * 500)}/month would put it on track`}.`,
      quiz: { question: "A goal shows 55% probability. Best response?", options: ["Ignore it", "Raise contribution or extend the date", "Switch everything to small-cap"], answer: 1, explain: "Contribution and time are the levers you control; chasing risk lowers certainty." },
    },
    {
      id: "emi", title: "Debt burden and the 40% rule", minutes: 3, level: "Beginner",
      summary: "How much of your income can safely go to EMIs.",
      body: [
        "Lenders look at EMIs as a share of income. Many advisers prefer to stay under 30% and treat 40% as a ceiling.",
        "High fixed obligations shrink your ability to absorb shocks, even when income is strong.",
      ],
      yourNumbers: `Your EMIs use ${pct(t.persona.bills.filter((b) => b.category === "emi").reduce((s, b) => s + b.amount, 0) / t.monthlyIncome)} of average income.`,
      quiz: { question: "Income ₹80,000, EMIs ₹24,000. Share?", options: ["24%", "30%", "40%"], answer: 1, explain: "24,000 ÷ 80,000 = 30%, right at the comfortable limit." },
    },
  ];
}
