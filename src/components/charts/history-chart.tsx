"use client";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoryPoint } from "@/types/twin";
import { inr } from "@/lib/utils";

export function HistoryChart({ data }: { data: HistoryPoint[] }) {
  const rows = data.map((d) => ({ ...d, label: new Date(d.month + "-01").toLocaleDateString("en-IN", { month: "short" }) }));
  return (
    <div className="h-64 w-full" role="img" aria-label="Income, expense and net savings for the last six months">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `₹${Math.round(Number(v) / 1000)}k`} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} formatter={(v) => inr(Number(v))} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill="#14b8a6" radius={[6, 6, 0, 0]} barSize={18} />
          <Bar dataKey="expense" name="Spending" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={18} />
          <Line dataKey="net" name="Saved" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} type="monotone" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
