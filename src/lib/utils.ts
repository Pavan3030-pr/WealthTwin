import type { RiskLevel } from "@/types/twin";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function inr(value: number, compact = false): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (compact) {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}k`;
  }
  return `${sign}₹${Math.round(abs).toLocaleString("en-IN")}`;
}

export function pct(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }): string {
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", opts);
}

export const RISK_STYLES: Record<RiskLevel, string> = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  medium: "bg-amber-50 text-amber-800 ring-amber-600/25",
  high: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export const RISK_LABEL: Record<RiskLevel, string> = { low: "Low", medium: "Moderate", high: "High" };

export const DONUT_COLORS = ["#0d9488", "#38bdf8", "#f59e0b", "#818cf8", "#94a3b8", "#f43f5e", "#34d399", "#fb923c", "#a78bfa"];
