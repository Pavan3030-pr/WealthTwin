import type { RiskLevel } from "@/types/twin";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(
  value: number,
  currency: string = "INR",
  compact = false
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function riskColor(level: RiskLevel): string {
  switch (level) {
    case "low":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "medium":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "high":
      return "text-red-700 bg-red-50 border-red-200";
  }
}

export function riskLabel(level: RiskLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}
