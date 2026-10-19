import { ShieldCheck } from "lucide-react";
import { cn, RISK_LABEL, RISK_STYLES } from "@/lib/utils";
import type { RiskLevel } from "@/types/twin";

export function RiskBadge({ level, suffix = "risk", text }: { level: RiskLevel; suffix?: string; text?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", RISK_STYLES[level])}>
      {text ?? `${RISK_LABEL[level]} ${suffix}`.trim()}
    </span>
  );
}

export function SyntheticBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      Synthetic data demo
    </span>
  );
}

export function Delta({ value, good }: { value: string; good: boolean | null }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", good === null ? "bg-slate-100 text-slate-600" : good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
      {value}
    </span>
  );
}
