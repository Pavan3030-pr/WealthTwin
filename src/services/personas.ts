import type { DemoPersonaId, Persona } from "@/types/twin";

export const PERSONAS: Record<DemoPersonaId, Persona> = {
  aarav: {
    id: "aarav",
    name: "Aarav Sharma",
    role: "Software engineer",
    city: "Hyderabad",
    age: 26,
    blurb: "Salaried, first investments, building an emergency fund.",
    incomeType: "salaried",
    monthlyIncome: 95000,
    incomeVolatility: 0.02,
    incomeDay: 1,
    bills: [
      { id: "b1", name: "Rent", amount: 22000, day: 5, category: "housing" },
      { id: "b2", name: "Electricity & internet", amount: 4200, day: 10, category: "utilities" },
      { id: "b3", name: "Streaming & apps", amount: 1800, day: 15, category: "subscription" },
      { id: "b4", name: "Health insurance", amount: 1500, day: 20, category: "insurance" },
      { id: "b5", name: "Laptop EMI", amount: 4500, day: 8, category: "emi" },
    ],
    variableSpend: 26000,
    cash: 95000,
    holdings: [
      { symbol: "NIFTYBEES", name: "Nifty 50 ETF", value: 185000, assetClass: "equity", expectedReturn: 0.115, volatility: 0.16, risk: "medium" },
      { symbol: "PPF", name: "Public Provident Fund", value: 120000, assetClass: "debt", expectedReturn: 0.071, volatility: 0.01, risk: "low" },
      { symbol: "LIQUIDBEES", name: "Liquid ETF", value: 75000, assetClass: "cash", expectedReturn: 0.065, volatility: 0.005, risk: "low" },
      { symbol: "SMALLCAP", name: "Small-cap Fund", value: 68000, assetClass: "equity", expectedReturn: 0.14, volatility: 0.26, risk: "high" },
      { symbol: "SGB", name: "Sovereign Gold Bond", value: 42000, assetClass: "gold", expectedReturn: 0.08, volatility: 0.14, risk: "medium" },
    ],
    goals: [
      { id: "g1", name: "Emergency Fund (6 months)", targetAmount: 360000, currentAmount: 170000, targetDate: "2028-09-01", monthly: 8000, kind: "emergency" },
      { id: "g2", name: "Home Down Payment", targetAmount: 1500000, currentAmount: 420000, targetDate: "2032-06-01", monthly: 12000, kind: "growth" },
      { id: "g3", name: "Retirement Corpus (age 60)", targetAmount: 25000000, currentAmount: 890000, targetDate: "2060-01-01", monthly: 6000, kind: "growth" },
    ],
    seed: 42,
  },
  meera: {
    id: "meera",
    name: "Meera Iyer",
    role: "Freelance designer",
    city: "Bengaluru",
    age: 31,
    blurb: "Irregular invoices, lumpy cashflow, needs a bigger buffer.",
    incomeType: "freelance",
    monthlyIncome: 118000,
    incomeVolatility: 0.38,
    incomeDay: 12,
    bills: [
      { id: "b1", name: "Rent", amount: 28000, day: 3, category: "housing" },
      { id: "b2", name: "Software & tools", amount: 6500, day: 7, category: "subscription" },
      { id: "b3", name: "Utilities", amount: 3800, day: 11, category: "utilities" },
      { id: "b4", name: "Health insurance", amount: 2400, day: 18, category: "insurance" },
      { id: "b5", name: "Equipment loan EMI", amount: 14000, day: 6, category: "emi" },
    ],
    variableSpend: 30000,
    cash: 90000,
    holdings: [
      { symbol: "NIFTYBEES", name: "Nifty 50 ETF", value: 210000, assetClass: "equity", expectedReturn: 0.115, volatility: 0.16, risk: "medium" },
      { symbol: "MIDCAP", name: "Mid-cap Index Fund", value: 130000, assetClass: "equity", expectedReturn: 0.13, volatility: 0.21, risk: "high" },
      { symbol: "LIQUIDBEES", name: "Liquid Fund", value: 60000, assetClass: "cash", expectedReturn: 0.065, volatility: 0.005, risk: "low" },
      { symbol: "NPS", name: "NPS Tier I (debt)", value: 95000, assetClass: "debt", expectedReturn: 0.08, volatility: 0.04, risk: "low" },
    ],
    goals: [
      { id: "g1", name: "Income Buffer (6 months)", targetAmount: 400000, currentAmount: 200000, targetDate: "2028-12-01", monthly: 6000, kind: "emergency" },
      { id: "g2", name: "Studio Setup", targetAmount: 700000, currentAmount: 150000, targetDate: "2030-06-01", monthly: 9000, kind: "growth" },
      { id: "g3", name: "Retirement Corpus (age 60)", targetAmount: 15000000, currentAmount: 520000, targetDate: "2055-01-01", monthly: 5000, kind: "growth" },
    ],
    seed: 77,
  },
  rohan: {
    id: "rohan",
    name: "Rohan Deshmukh",
    role: "Product manager, parent of two",
    city: "Pune",
    age: 38,
    blurb: "High income, heavy fixed costs, home loan and school fees.",
    incomeType: "salaried",
    monthlyIncome: 210000,
    incomeVolatility: 0.03,
    incomeDay: 28,
    bills: [
      { id: "b1", name: "Home loan EMI", amount: 62000, day: 5, category: "emi" },
      { id: "b2", name: "School fees", amount: 18000, day: 10, category: "education" },
      { id: "b3", name: "Utilities & maintenance", amount: 9500, day: 12, category: "utilities" },
      { id: "b4", name: "Term & health insurance", amount: 7800, day: 20, category: "insurance" },
      { id: "b5", name: "Subscriptions & clubs", amount: 5200, day: 15, category: "subscription" },
    ],
    variableSpend: 48000,
    cash: 260000,
    holdings: [
      { symbol: "NIFTYBEES", name: "Nifty 50 ETF", value: 640000, assetClass: "equity", expectedReturn: 0.115, volatility: 0.16, risk: "medium" },
      { symbol: "FLEXICAP", name: "Flexi-cap Fund", value: 420000, assetClass: "equity", expectedReturn: 0.125, volatility: 0.18, risk: "medium" },
      { symbol: "EPF", name: "Employee Provident Fund", value: 980000, assetClass: "debt", expectedReturn: 0.0825, volatility: 0.01, risk: "low" },
      { symbol: "LIQUIDBEES", name: "Liquid Fund", value: 150000, assetClass: "cash", expectedReturn: 0.065, volatility: 0.005, risk: "low" },
      { symbol: "GOLDBEES", name: "Gold ETF", value: 180000, assetClass: "gold", expectedReturn: 0.08, volatility: 0.14, risk: "medium" },
    ],
    goals: [
      { id: "g1", name: "Emergency Fund (6 months)", targetAmount: 900000, currentAmount: 410000, targetDate: "2030-09-01", monthly: 10000, kind: "emergency" },
      { id: "g2", name: "Children's Education", targetAmount: 4000000, currentAmount: 650000, targetDate: "2036-06-01", monthly: 20000, kind: "growth" },
      { id: "g3", name: "Retirement Corpus (age 60)", targetAmount: 40000000, currentAmount: 2100000, targetDate: "2048-01-01", monthly: 25000, kind: "growth" },
    ],
    seed: 131,
  },
};

export const PERSONA_IDS = Object.keys(PERSONAS) as DemoPersonaId[];

export function isDemoPersonaId(v: unknown): v is DemoPersonaId {
  return typeof v === "string" && v in PERSONAS;
}
