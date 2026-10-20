"use client";
import { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/surface";
import { cn, inr } from "@/lib/utils";

export function SafeToSpend({ headroom, perDay, minBalance90, floor }: { headroom: number; perDay: number; minBalance90: number; floor: number }) {
  const [amount, setAmount] = useState(10000);
  const after = minBalance90 - amount;
  const ok = after >= floor;
  const pctUsed = Math.min(100, headroom > 0 ? (amount / headroom) * 100 : 100);
  return (
    <Card>
      <CardTitle hint="Spend this without breaching your safety floor in the next 90 days">Safe to spend</CardTitle>
      <p className="num text-3xl font-semibold tracking-tight text-slate-900">{inr(headroom)}</p>
      <p className="mt-0.5 text-xs text-slate-500">about {inr(perDay)} a day over the next 30 days</p>
      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-sm"><label htmlFor="sts" className="font-medium text-slate-700">Check a purchase</label><span className="num text-slate-600">{inr(amount)}</span></div>
        <input id="sts" type="range" min={1000} max={200000} step={1000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={cn("h-full rounded-full transition-all", ok ? "bg-teal-500" : "bg-rose-400")} style={{ width: `${pctUsed}%` }} /></div>
        <div className={cn("mt-3 flex items-start gap-2 rounded-xl p-3 text-sm", ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")} aria-live="polite">
          {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          <span>{ok ? `Fits. Your lowest balance would be ${inr(after)}, above the ${inr(floor)} floor.` : `Too tight. Your lowest balance would drop to ${inr(after)}, below the ${inr(floor)} floor.`}</span>
        </div>
      </div>
    </Card>
  );
}
