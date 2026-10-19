"use client";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ForecastPoint } from "@/types/twin";
import { fmtDate, inr } from "@/lib/utils";

export function ForecastChart({ data, floor, height = 320, compare }: { data: ForecastPoint[]; floor: number; height?: number; compare?: ForecastPoint[] }) {
  const rows = data.map((d, i) => ({ ...d, scenario: compare?.[i]?.expected }));
  return (
    <div style={{ height }} className="w-full" role="img" aria-label="Projected cash balance for the next 90 days with a likely range">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tickFormatter={(v) => fmtDate(String(v))} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} minTickGap={36} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => inr(Number(v), true)} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
            labelFormatter={(l) => fmtDate(String(l), { weekday: "short", day: "numeric", month: "short" })}
            formatter={(v, name) => (Array.isArray(v) ? [`${inr(Number(v[0]))} to ${inr(Number(v[1]))}`, "Likely range"] : [inr(Number(v)), String(name)])}
          />
          <Area dataKey="band" name="Likely range" stroke="none" fill="url(#band)" isAnimationActive={false} />
          <ReferenceLine y={floor} stroke="#f59e0b" strokeDasharray="5 4" label={{ value: "Safety floor", position: "insideTopRight", fontSize: 11, fill: "#b45309" }} />
          <ReferenceLine y={0} stroke="#f43f5e" strokeOpacity={0.5} />
          <Line dataKey="expected" name={compare ? "Today" : "Projected balance"} stroke={compare ? "#94a3b8" : "#0d9488"} strokeWidth={2.5} dot={false} type="monotone" />
          {compare && <Line dataKey="scenario" name="Scenario" stroke="#0d9488" strokeWidth={2.5} dot={false} type="monotone" />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
