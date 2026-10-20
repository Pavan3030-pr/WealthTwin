"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DONUT_COLORS as COLORS, inr } from "@/lib/utils";


export function AllocationDonut({ data, centerLabel, centerValue }: { data: { name: string; value: number }[]; centerLabel: string; centerValue: string }) {
  return (
    <div className="relative h-52 w-52 shrink-0" role="img" aria-label={`${centerLabel} breakdown`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={2} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} formatter={(v) => inr(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-lg font-semibold text-slate-900">{centerValue}</span>
        <span className="text-xs uppercase tracking-wider text-slate-500">{centerLabel}</span>
      </div>
    </div>
  );
}
