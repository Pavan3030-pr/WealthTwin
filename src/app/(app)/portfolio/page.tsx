import { AssumptionsNote } from "@/components/ui/assumptions-note";
import { getTwin } from "@/lib/twin-session";
import { Card, CardTitle, PageHeader } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/badges";
import { AllocationDonut } from "@/components/charts/allocation-donut";
import { DONUT_COLORS, inr, pct } from "@/lib/utils";

const CLASS_LABEL = { equity: "Equity", debt: "Debt", gold: "Gold", cash: "Cash & liquid" } as const;

export default async function PortfolioPage() {
  const t = await getTwin();
  return (
    <>
      <PageHeader eyebrow="Portfolio" title="Allocation, risk and rebalancing" subtitle="Educational analysis against an age-based target mix. Not investment advice." right={<RiskBadge level={t.portfolioRisk} suffix="volatility" />} />
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center">
          <CardTitle>Holdings mix</CardTitle>
          <AllocationDonut data={t.holdings.map((h) => ({ name: h.name, value: h.value }))} centerLabel="invested" centerValue={inr(t.invested, true)} />
        </Card>
        <Card className="overflow-x-auto">
          <CardTitle hint="Weight, expected return and volatility per holding">Holdings</CardTitle>
          <table className="w-full min-w-[520px] text-sm">
            <thead><tr className="text-left text-xs text-slate-500"><th className="pb-2 font-medium">Holding</th><th className="pb-2 text-right font-medium">Value</th><th className="pb-2 text-right font-medium">Weight</th><th className="pb-2 text-right font-medium">Exp. return</th><th className="pb-2 text-right font-medium">Risk</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {t.holdings.map((h, i) => (
                <tr key={h.symbol}>
                  <td className="py-2.5"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} /><span><span className="block font-medium text-slate-900">{h.name}</span><span className="block text-xs text-slate-400">{h.symbol} · {CLASS_LABEL[h.assetClass]}</span></span></span></td>
                  <td className="num py-2.5 text-right">{inr(h.value)}</td>
                  <td className="num py-2.5 text-right">{pct(h.allocation, 1)}</td>
                  <td className="num py-2.5 text-right">{pct(h.expectedReturn, 1)}</td>
                  <td className="py-2.5 text-right"><RiskBadge level={h.risk} suffix="" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <Card className="mt-5">
        <CardTitle hint={`Suggested equity share for age ${t.persona.age} is ${pct(t.targetEquityShare)}; you hold ${pct(t.equityShare)}`}>Rebalancing plan</CardTitle>
        {t.rebalance.length === 0 ? <p className="text-sm text-slate-500">Your mix is within 6 points of target in every asset class.</p> : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.rebalance.map((m) => (
              <li key={m.assetClass} className="rounded-xl border border-slate-200/80 p-4">
                <p className="text-xs text-slate-500">{CLASS_LABEL[m.assetClass]}</p>
                <p className="num mt-1 text-lg font-semibold text-slate-900">{m.amount > 0 ? "Add" : "Trim"} {inr(Math.abs(m.amount), true)}</p>
                <p className="num mt-1 text-xs text-slate-500">{pct(m.currentShare)} → {pct(m.targetShare)}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-slate-400">Tip: route new SIPs to underweight classes first; it rebalances without selling.</p>
      </Card>
      <AssumptionsNote><p>The target equity share is (110 − age)%, kept between 30% and 75%. Other classes split the remainder as debt 55%, gold 20% and cash 25%. A move is suggested only when a class drifts 6 points or more.</p></AssumptionsNote>
    </>
  );
}
