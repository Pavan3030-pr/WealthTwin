export type RiskLevel = "low" | "medium" | "high";
export type AssetClass = "equity" | "debt" | "gold" | "cash";
export type PersonaId = "aarav" | "meera" | "rohan";
export type BillCategory = "housing" | "emi" | "utilities" | "insurance" | "subscription" | "education";

export interface Bill {
  id: string;
  name: string;
  amount: number;
  day: number;
  category: BillCategory;
}

export interface HoldingSeed {
  symbol: string;
  name: string;
  value: number;
  assetClass: AssetClass;
  expectedReturn: number;
  volatility: number;
  risk: RiskLevel;
}

export interface GoalSeed {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthly: number;
  kind: "emergency" | "growth";
}

export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  city: string;
  age: number;
  blurb: string;
  incomeType: "salaried" | "freelance";
  monthlyIncome: number;
  incomeVolatility: number;
  incomeDay: number;
  bills: Bill[];
  variableSpend: number;
  cash: number;
  holdings: HoldingSeed[];
  goals: GoalSeed[];
  seed: number;
}

export interface Overrides {
  extraSip?: number;
  expenseCutPct?: number;
  incomeChangePct?: number;
  oneTimeShock?: number;
  marketDropPct?: number;
  equityReturn?: number;
}

export interface Factor {
  id: string;
  label: string;
  impact: "positive" | "negative" | "neutral";
  points: number;
  max: number;
  detail: string;
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  severity: RiskLevel;
  category: "cashflow" | "portfolio" | "goals" | "spending";
  href?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  href: string;
  cta: string;
}

export interface HistoryPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface ForecastPoint {
  date: string;
  expected: number;
  low: number;
  high: number;
  band: [number, number];
  events: string[];
}

export interface Holding extends HoldingSeed {
  allocation: number;
}

export interface Goal extends GoalSeed {
  progress: number;
  expectedReturn: number;
  volatility: number;
  etaDate: string | null;
  onTrack: boolean;
  probability: number;
  requiredMonthly: number;
}

export interface SpendSlice {
  category: string;
  amount: number;
}

export interface RebalanceMove {
  assetClass: AssetClass;
  currentShare: number;
  targetShare: number;
  amount: number;
}

export interface TwinState {
  persona: Persona;
  asOf: string;
  currency: "INR";
  score: number;
  grade: string;
  factors: Factor[];
  cashflowHealth: RiskLevel;
  portfolioRisk: RiskLevel;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySurplus: number;
  savingsRate: number;
  emergencyMonths: number;
  liquid: number;
  invested: number;
  netWorth: number;
  history: HistoryPoint[];
  forecast: ForecastPoint[];
  safetyFloor: number;
  stress: {
    minBalance: number;
    minDate: string;
    pessimisticMin: number;
    daysBelowFloor: number;
    firstStressDate: string | null;
  };
  spending: SpendSlice[];
  holdings: Holding[];
  equityShare: number;
  targetEquityShare: number;
  rebalance: RebalanceMove[];
  goals: Goal[];
  projection: { year: number; base: number; downside: number }[];
  insights: Insight[];
  recommendations: Recommendation[];
  isSynthetic: true;
}
