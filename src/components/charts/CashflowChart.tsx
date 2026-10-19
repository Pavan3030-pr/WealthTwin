"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { CashflowPoint } from "@/types/twin";

interface CashflowChartProps {
  data: CashflowPoint[];
}

export function CashflowChart({ data }: CashflowChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#78716C" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={48} />
          <Tooltip
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid #E7E5E4",
              borderRadius: "12px",
              fontSize: "13px",
            }}
            formatter={(value: number, name: string) => [
              `₹${value.toLocaleString("en-IN")}`,
              name === "income" ? "Income" : name === "expense" ? "Expense" : "Net",
            ]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} formatter={(value) => (value === "income" ? "Income" : value === "expense" ? "Expense" : value)} />
          <Area type="monotone" dataKey="income" stroke="#0D9488" strokeWidth={2} fill="url(#incomeGrad)" name="income" />
          <Area type="monotone" dataKey="expense" stroke="#F59E0B" strokeWidth={2} fill="url(#expenseGrad)" name="expense" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
