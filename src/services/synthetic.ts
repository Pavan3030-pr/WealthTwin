import type {
  TwinState,
  CashflowPoint,
  PortfolioHolding,
  Goal,
  Insight,
  Recommendation,
  Factor,
  RiskLevel,
} from "@/types/twin";

/** All data is synthetic for the PoC. */

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateCashflowSeries(months = 6): CashflowPoint[] {
  const rand = seededRandom(42);
  const points: CashflowPoint[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const income = 85000 + Math.floor(rand() * 15000);
    const expense = 52000 + Math.floor(rand() * 18000);
    points.push({
      date: d.toISOString().slice(0, 7),
      income,
      expense,
      net: income - expense,
    });
  }
  return points;
}

function generateHoldings(): PortfolioHolding[] {
  return [
    { symbol: "NIFTYBEES", name: "Nifty 50 ETF", value: 185000, allocation: 0.38, risk: "medium" },
    { symbol: "PPF", name: "Public Provident Fund", value: 120000, allocation: 0.25, risk: "low" },
    { symbol: "LIQUIDBEES", name: "Liquid ETF", value: 75000, allocation: 0.15, risk: "low" },
    { symbol: "SMALLCAP", name: "Small-cap Fund", value: 68000, allocation: 0.14, risk: "high" },
    { symbol: "GOLD", name: "Sovereign Gold Bond", value: 42000, allocation: 0.08, risk: "low" },
  ];
}

function generateGoals(): Goal[] {
  return [
    { id: "g1", name: "Emergency Fund (6 months)", targetAmount: 360000, currentAmount: 210000, targetDate: "2027-03-01", progress: 210000 / 360000 },
    { id: "g2", name: "Home Down Payment", targetAmount: 1500000, currentAmount: 420000, targetDate: "2029-06-01", progress: 420000 / 1500000 },
    { id: "g3", name: "Retirement Corpus (age 60)", targetAmount: 25000000, currentAmount: 890000, targetDate: "2055-01-01", progress: 890000 / 25000000 },
  ];
}

export function computeTwinState(): TwinState {
  const cashflowSeries = generateCashflowSeries(6);
  const holdings = generateHoldings();
  const goals = generateGoals();

  const monthlyIncome = cashflowSeries.reduce((s, p) => s + p.income, 0) / cashflowSeries.length;
  const monthlyExpense = cashflowSeries.reduce((s, p) => s + p.expense, 0) / cashflowSeries.length;
  const avgNet = monthlyIncome - monthlyExpense;
  const netWorth = holdings.reduce((s, h) => s + h.value, 0) + 95000;
  const emergencyFundMonths = 210000 / monthlyExpense;

  let score = 62;
  const factors: Factor[] = [];

  if (avgNet > 20000) {
    score += 12;
    factors.push({ id: "f1", label: "Positive monthly surplus", impact: "positive", weight: 0.25, detail: `Average surplus ~₹${Math.round(avgNet).toLocaleString("en-IN")}` });
  } else {
    score -= 8;
    factors.push({ id: "f1", label: "Thin monthly surplus", impact: "negative", weight: 0.2 });
  }

  if (emergencyFundMonths >= 4) {
    score += 10;
    factors.push({ id: "f2", label: "Emergency fund coverage", impact: "positive", weight: 0.2, detail: `${emergencyFundMonths.toFixed(1)} months of expenses` });
  } else {
    score -= 10;
    factors.push({ id: "f2", label: "Emergency fund below 4 months", impact: "negative", weight: 0.25 });
  }

  const highRiskAlloc = holdings.filter((h) => h.risk === "high").reduce((s, h) => s + h.allocation, 0);
  if (highRiskAlloc > 0.2) {
    score -= 6;
    factors.push({ id: "f3", label: "Elevated high-risk allocation", impact: "negative", weight: 0.15, detail: `${(highRiskAlloc * 100).toFixed(0)}% in high-risk assets` });
  } else {
    score += 5;
    factors.push({ id: "f3", label: "Balanced risk allocation", impact: "positive", weight: 0.1 });
  }

  score = Math.max(0, Math.min(100, score));

  const cashflowHealth: RiskLevel = avgNet > 25000 ? "low" : avgNet > 10000 ? "medium" : "high";
  const portfolioRisk: RiskLevel = highRiskAlloc > 0.25 ? "high" : highRiskAlloc > 0.12 ? "medium" : "low";

  const insights: Insight[] = [
    { id: "i1", title: "Cashflow buffer is healthy this quarter", body: "Your average monthly surplus has stayed above ₹20k for the last 4 months. This reduces short-term stress risk.", severity: "low", category: "cashflow", createdAt: new Date().toISOString() },
    { id: "i2", title: "Emergency fund still 2 months short of target", body: "At current surplus you are on track to reach 6 months of expenses in ~7 months if you prioritise the goal.", severity: "medium", category: "goals", createdAt: new Date().toISOString() },
    { id: "i3", title: "Small-cap exposure is elevated", body: "14% of portfolio sits in high-volatility small-cap. Consider rebalancing if your risk tolerance is moderate.", severity: "medium", category: "portfolio", createdAt: new Date().toISOString() },
  ];

  const recommendations: Recommendation[] = [
    { id: "r1", title: "Auto-sweep ₹8,000/month into emergency fund", description: "Moving a fixed surplus into a liquid fund will close the 6-month gap faster without changing lifestyle.", impactEstimate: "+1.1 months coverage in 90 days", actionLabel: "Simulate" },
    { id: "r2", title: "Review small-cap allocation", description: "Trim 4–5% from small-cap into Nifty or debt to bring high-risk share under 10%.", impactEstimate: "Lower portfolio volatility", actionLabel: "View allocation" },
    { id: "r3", title: "Start a ₹2,000 SIP in a target-date fund", description: "Small automated contribution compounds toward the home down-payment goal with less decision fatigue.", impactEstimate: "~₹1.1L extra in 3 years (illustrative)", actionLabel: "Learn more" },
  ];

  return {
    userId: "demo-user-001",
    displayName: "Aarav Sharma",
    lastUpdated: new Date().toISOString(),
    currency: "INR",
    financialHealthScore: score,
    cashflowHealth,
    portfolioRisk,
    emergencyFundMonths,
    netWorth,
    monthlyIncome,
    monthlyExpense,
    cashflowSeries,
    holdings,
    goals,
    insights,
    recommendations,
    factors,
    isSynthetic: true,
  };
}
