import type { ForecastPoint } from "@/types/twin";
import { fmtDate, inr } from "@/lib/utils";

/** Static, print-safe SVG version of the forecast (no client JS needed). */
export function ForecastSvg({ data, floor }: { data: ForecastPoint[]; floor: number }) {
  const W = 720, H = 170, L = 52, R = 8, T = 10, B = 22;
  const lo = Math.min(0, ...data.map((d) => d.low)), hi = Math.max(floor * 1.2, ...data.map((d) => d.high));
  const x = (i: number) => L + (i / (data.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
  const line = data.map((d, i) => `${x(i).toFixed(1)},${y(d.expected).toFixed(1)}`).join(" ");
  const band = [...data.map((d, i) => `${x(i).toFixed(1)},${y(d.high).toFixed(1)}`), ...data.map((d, i) => `${x(data.length - 1 - i).toFixed(1)},${y(data[data.length - 1 - i].low).toFixed(1)}`)].join(" ");
  const min = data.reduce((m, d, i) => (d.expected < m.v ? { v: d.expected, i } : m), { v: Infinity, i: 0 });
  const ticks = [0, 0.5, 1].map((p) => lo + p * (hi - lo));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Projected cash balance for the next 90 days with a likely range">
      {ticks.map((t) => (<g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray="3 3" /><text x={L - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#64748b">{inr(t, true)}</text></g>))}
      <polygon points={band} fill="#14b8a6" fillOpacity="0.14" />
      <line x1={L} x2={W - R} y1={y(floor)} y2={y(floor)} stroke="#f59e0b" strokeDasharray="5 4" />
      <text x={W - R} y={y(floor) - 3} textAnchor="end" fontSize="9" fill="#b45309">Safety floor {inr(floor, true)}</text>
      <polyline points={line} fill="none" stroke="#0d9488" strokeWidth="2" strokeLinejoin="round" />
      <circle cx={x(min.i)} cy={y(min.v)} r="3.5" fill="#0f172a" />
      <text x={Math.min(x(min.i), W - 110)} y={y(min.v) + 14} fontSize="9" fill="#0f172a">Low {inr(min.v, true)} · {fmtDate(data[min.i].date)}</text>
      <text x={L} y={H - 6} fontSize="9" fill="#64748b">{fmtDate(data[0].date)}</text>
      <text x={W - R} y={H - 6} textAnchor="end" fontSize="9" fill="#64748b">{fmtDate(data[data.length - 1].date)}</text>
    </svg>
  );
}
