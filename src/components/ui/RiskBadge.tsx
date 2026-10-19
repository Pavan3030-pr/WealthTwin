import { cn, riskColor, riskLabel } from "@/lib/utils";
import type { RiskLevel } from "@/types/twin";

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        riskColor(level)
      )}
    >
      {riskLabel(level)} risk
    </span>
  );
}
