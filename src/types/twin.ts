export type RiskLevel = "low" | "medium" | "high";

export interface Factor {
  id: string;
  label: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  detail?: string;
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  severity: RiskLevel;
  category: "cashflow" | "portfolio" | "goals" | "education";
  createdAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impactEstimate?: string;
  actionLabel?: string;
}

export interface CashflowPoint {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  value: number;
  allocation: number;
  risk: RiskLevel;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  progress: number;
}

export interface TwinState {
  userId: string;
  displayName: string;
  lastUpdated: string;
  currency: string;
  financialHealthScore: number;
  cashflowHealth: RiskLevel;
  portfolioRisk: RiskLevel;
  emergencyFundMonths: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  cashflowSeries: CashflowPoint[];
  holdings: PortfolioHolding[];
  goals: Goal[];
  insights: Insight[];
  recommendations: Recommendation[];
  factors: Factor[];
  isSynthetic: true;
}
