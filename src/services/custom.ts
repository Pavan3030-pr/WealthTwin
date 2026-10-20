/** "Use my own numbers": validated user input -> Persona that the same engine consumes. */
import type { Bill, GoalSeed, HoldingSeed, Persona, PersonaId } from "@/types/twin";
import { CLASS_DEFAULTS, RETIREMENT } from "./assumptions";
import { PERSONAS, isDemoPersonaId } from "./personas";

export interface CustomInput {
  name: string; age: number; incomeType: "salaried" | "freelance";
  monthlyIncome: number; incomeVariation: number; incomeDay: number;
  housing: number; emi: number; utilities: number; insurance: number; subscriptions: number; education: number;
  flexibleSpend: number;
  cash: number; liquid: number; debt: number; equity: number; gold: number;
  emergencyMonthly: number;
  goalName: string; goalTarget: number; goalCurrent: number; goalMonthly: number; goalDate: string;
  retireCurrent: number; retireMonthly: number;
}

export const EXAMPLE_INPUT: CustomInput = {
  name: "Priya", age: 29, incomeType: "salaried", monthlyIncome: 120000, incomeVariation: 3, incomeDay: 1,
  housing: 26000, emi: 8000, utilities: 4500, insurance: 2000, subscriptions: 2500, education: 0,
  flexibleSpend: 32000,
  cash: 110000, liquid: 60000, debt: 150000, equity: 240000, gold: 40000,
  emergencyMonthly: 10000,
  goalName: "Car down payment", goalTarget: 600000, goalCurrent: 120000, goalMonthly: 12000, goalDate: "",
  retireCurrent: 380000, retireMonthly: 8000,
};

type Rule = { min: number; max: number; label: string };
const NUM: Record<Exclude<keyof CustomInput, "name" | "incomeType" | "goalName" | "goalDate">, Rule> = {
  age: { min: 18, max: 70, label: "Age" },
  monthlyIncome: { min: 5000, max: 5_000_000, label: "Monthly income" },
  incomeVariation: { min: 0, max: 60, label: "Income variation" },
  incomeDay: { min: 1, max: 28, label: "Income day" },
  housing: { min: 0, max: 2_000_000, label: "Housing" },
  emi: { min: 0, max: 2_000_000, label: "Loan EMIs" },
  utilities: { min: 0, max: 500_000, label: "Utilities" },
  insurance: { min: 0, max: 500_000, label: "Insurance" },
  subscriptions: { min: 0, max: 500_000, label: "Subscriptions" },
  education: { min: 0, max: 1_000_000, label: "Education" },
  flexibleSpend: { min: 0, max: 3_000_000, label: "Flexible spending" },
  cash: { min: 0, max: 100_000_000, label: "Bank balance" },
  liquid: { min: 0, max: 100_000_000, label: "Liquid funds" },
  debt: { min: 0, max: 100_000_000, label: "Debt and provident funds" },
  equity: { min: 0, max: 100_000_000, label: "Equity" },
  gold: { min: 0, max: 100_000_000, label: "Gold" },
  emergencyMonthly: { min: 0, max: 2_000_000, label: "Emergency fund contribution" },
  goalTarget: { min: 10_000, max: 1_000_000_000, label: "Goal target" },
  goalCurrent: { min: 0, max: 1_000_000_000, label: "Goal saved so far" },
  goalMonthly: { min: 0, max: 2_000_000, label: "Goal contribution" },
  retireCurrent: { min: 0, max: 1_000_000_000, label: "Retirement corpus" },
  retireMonthly: { min: 0, max: 2_000_000, label: "Retirement contribution" },
};

const cleanText = (v: unknown, max: number, fallback: string) => {
  const t = typeof v === "string" ? v.replace(/[^\p{L}\p{N} .'’&-]/gu, "").trim().slice(0, max) : "";
  return t || fallback;
};

const pad = (n: number) => String(n).padStart(2, "0");
const ym = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

export function defaultGoalDate(now = new Date()): string {
  return ym(new Date(now.getFullYear() + 3, now.getMonth(), 1));
}

export type Validation = { ok: true; value: CustomInput } | { ok: false; errors: Partial<Record<keyof CustomInput | "form", string>> };

export function validateCustom(raw: unknown, now = new Date()): Validation {
  const src = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const errors: Partial<Record<keyof CustomInput | "form", string>> = {};
  const out = {} as Record<string, unknown>;

  for (const [k, r] of Object.entries(NUM)) {
    const v = src[k];
    const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
    if (!Number.isFinite(n)) { errors[k as keyof CustomInput] = `${r.label} must be a number`; continue; }
    if (n < r.min || n > r.max) { errors[k as keyof CustomInput] = `${r.label} must be between ${r.min.toLocaleString("en-IN")} and ${r.max.toLocaleString("en-IN")}`; continue; }
    out[k] = Math.round(n * 100) / 100;
  }
  out.name = cleanText(src.name, 40, "You");
  out.goalName = cleanText(src.goalName, 50, "My goal");
  out.incomeType = src.incomeType === "freelance" ? "freelance" : "salaried";

  const gd = typeof src.goalDate === "string" && src.goalDate ? src.goalDate : defaultGoalDate(now);
  if (!/^\d{4}-\d{2}$/.test(gd)) errors.goalDate = "Pick a month for your goal";
  else {
    const d = new Date(`${gd}-01T00:00:00`);
    const months = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth());
    if (!(months >= 3 && months <= 480)) errors.goalDate = "Goal date must be between 3 months and 40 years from now";
    out.goalDate = gd;
  }

  if (Object.keys(errors).length === 0) {
    const v = out as unknown as CustomInput;
    const spend = v.housing + v.emi + v.utilities + v.insurance + v.subscriptions + v.education + v.flexibleSpend;
    if (spend < 1000) errors.form = "Add at least ₹1,000 of monthly spending so the twin has something to model";
    else if (v.goalCurrent >= v.goalTarget) errors.goalCurrent = "Saved so far must be below the goal target";
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value: out as unknown as CustomInput };
}

export function personaFromInput(v: CustomInput, now = new Date()): Persona {
  const bills: Bill[] = ([
    ["Housing", v.housing, 5, "housing"], ["Loan EMIs", v.emi, 8, "emi"], ["Utilities", v.utilities, 10, "utilities"],
    ["Insurance", v.insurance, 20, "insurance"], ["Subscriptions", v.subscriptions, 15, "subscription"], ["Education", v.education, 12, "education"],
  ] as const).filter(([, amt]) => amt > 0).map(([name, amount, day, category], i) => ({ id: `b${i + 1}`, name, amount, day, category }));

  const hs: [string, string, number, keyof typeof CLASS_DEFAULTS, "low" | "medium" | "high"][] = [
    ["EQUITY", "Equity funds", v.equity, "equity", "medium"], ["DEBT", "Debt and provident funds", v.debt, "debt", "low"],
    ["GOLD", "Gold", v.gold, "gold", "medium"], ["LIQUID", "Liquid funds", v.liquid, "cash", "low"],
  ];
  const holdings: HoldingSeed[] = hs.filter(([, , val]) => val > 0).map(([symbol, name, value, assetClass, risk]) => ({ symbol, name, value, assetClass, risk, ...CLASS_DEFAULTS[assetClass] }));
  if (!holdings.length) holdings.push({ symbol: "LIQUID", name: "Liquid funds", value: 0, assetClass: "cash", risk: "low", ...CLASS_DEFAULTS.cash });

  const monthlySpend = bills.reduce((s, b) => s + b.amount, 0) + v.flexibleSpend;
  const retireYear = now.getFullYear() + Math.max(1, RETIREMENT.age - v.age);
  const goals: GoalSeed[] = [
    { id: "g1", name: "Emergency Fund (6 months)", targetAmount: Math.round(monthlySpend * 6), currentAmount: 0, targetDate: `${now.getFullYear() + 2}-${pad(now.getMonth() + 1)}-01`, monthly: v.emergencyMonthly, kind: "emergency" },
    { id: "g2", name: v.goalName, targetAmount: v.goalTarget, currentAmount: v.goalCurrent, targetDate: `${v.goalDate}-01`, monthly: v.goalMonthly, kind: "growth" },
    { id: "g3", name: `Retirement Corpus (age ${RETIREMENT.age})`, targetAmount: Math.max(Math.round(monthlySpend * 12 * RETIREMENT.multiple), v.retireCurrent + 1), currentAmount: v.retireCurrent, targetDate: `${retireYear}-01-01`, monthly: v.retireMonthly, kind: "growth" },
  ];

  return {
    id: "custom", name: v.name, role: v.incomeType === "freelance" ? "Freelancer" : "Salaried", city: "Your own numbers", age: v.age,
    blurb: "Built from the numbers you entered. Stored only in a cookie on this device.",
    incomeType: v.incomeType, monthlyIncome: v.monthlyIncome, incomeVolatility: v.incomeVariation / 100, incomeDay: v.incomeDay,
    bills, variableSpend: v.flexibleSpend, cash: v.cash, holdings, goals, seed: 2026,
  };
}

export function parseCustomCookie(value: string | undefined, now = new Date()): { input: CustomInput; persona: Persona } | null {
  if (!value || value.length > 4000) return null;
  try {
    const r = validateCustom(JSON.parse(value), now);
    return r.ok ? { input: r.value, persona: personaFromInput(r.value, now) } : null;
  } catch { return null; }
}

export function resolvePersona(id: unknown, customCookie?: string): Persona | null {
  if (id === "custom") return parseCustomCookie(customCookie)?.persona ?? null;
  return isDemoPersonaId(id) ? PERSONAS[id] : null;
}

export type { PersonaId };
