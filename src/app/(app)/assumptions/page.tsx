import { getTwin } from "@/lib/twin-session";
import { Card, CardTitle, PageHeader } from "@/components/ui/card";
import { A, CLASS_DEFAULTS, RETIREMENT, SCORE } from "@/services/assumptions";
import { pct } from "@/lib/utils";

function Row({ k, v, why }: { k: string; v: string; why: string }) {
  return (
    <tr className="align-top"><td className="py-2.5 pr-4 font-medium text-slate-800">{k}</td><td className="num py-2.5 pr-4 text-slate-900">{v}</td><td className="py-2.5 text-slate-500">{why}</td></tr>
  );
}
function Table({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-x-auto"><CardTitle hint={hint}>{title}</CardTitle>
      <table className="w-full min-w-[560px] text-sm"><thead><tr className="text-left text-xs text-slate-500"><th className="pb-2 font-medium">Assumption</th><th className="pb-2 font-medium">Value</th><th className="pb-2 font-medium">Why</th></tr></thead><tbody className="divide-y divide-slate-100">{children}</tbody></table>
    </Card>
  );
}

export default async function AssumptionsPage() {
  const t = await getTwin();
  return (
    <>
      <PageHeader eyebrow="Transparency" title="Every assumption behind the numbers" subtitle="WealthTwin is an illustrative model. These values come from one file in the code, so what you read here is exactly what runs." />
      <div className="space-y-5">
        <Table title="Cashflow forecast" hint="Day-by-day balance for the next 90 days">
          <Row k="Horizon" v={`${A.FORECAST_DAYS} days`} why="Long enough to see two pay cycles and most bill rhythms." />
          <Row k="Safety floor" v={`${A.SAFETY_FLOOR_DAYS} days of spending`} why="A cushion that covers a delayed payment or a surprise bill." />
          <Row k="Daily spending noise" v={`±${pct(A.DAILY_NOISE)}`} why="Real spending is lumpy; seeded so results are repeatable." />
          <Row k="Weekend spending" v={`${A.WEEKEND_FACTOR}× weekdays`} why="People spend more on Saturdays and Sundays." />
          <Row k="Pessimistic case" v={`Spend ${A.PESSIMISTIC_VARIABLE}×, income lower by ${pct(A.PESSIMISTIC_INCOME_BASE)} plus half your income variation`} why="Shows the downside edge of the shaded band." />
          <Row k="Optimistic case" v={`Spend ${A.OPTIMISTIC_VARIABLE}×, income ${A.OPTIMISTIC_INCOME}×`} why="Upper edge of the band." />
          <Row k="Freelance income" v="About 2.5 invoices a month, ±60% each" why="Models irregular, lumpy payments for freelance profiles." />
        </Table>
        <Table title="Health score" hint="Five factors add up to 100">
          <Row k="Savings rate" v={`${SCORE.rate.max} pts at ${pct(SCORE.rate.target)}+`} why="Linear below target." />
          <Row k="Emergency runway" v={`${SCORE.runway.max} pts at ${SCORE.runway.months}+ months`} why="Liquid assets divided by monthly spending." />
          <Row k="Cashflow stability" v={`${SCORE.stability.max} / ${SCORE.stability.mid} / ${SCORE.stability.low} pts`} why="Low, moderate or high 90-day stress." />
          <Row k="Debt burden" v={`${SCORE.debt.max} pts under ${pct(SCORE.debt.full)} EMI share, 0 at ${pct(SCORE.debt.zero)}`} why="EMIs as a share of income." />
          <Row k="Portfolio fit" v={`${SCORE.mix.max} pts; −${SCORE.mix.penalty} if one holding exceeds ${pct(SCORE.mix.concentration)}`} why="Distance of equity share from the age-based target." />
        </Table>
        <Table title="Portfolio and goals" hint="Simplified, for education">
          <Row k="Target equity share" v={`(${A.EQUITY_RULE} − age)%, kept between ${pct(A.EQUITY_MIN)} and ${pct(A.EQUITY_MAX)}`} why="A common rule of thumb, not personal advice." />
          <Row k="Rebalance trigger" v={`${pct(A.REBALANCE_BAND)} drift in an asset class`} why="Avoids over-trading small differences." />
          <Row k="Portfolio volatility" v={`Weighted volatility × ${A.DIVERSIFICATION}`} why="Crude diversification credit; ignores exact correlations." />
          <Row k="Risk bands" v={`Low < ${pct(A.VOL_LOW)}, moderate < ${pct(A.VOL_MED)}, else high`} why="Applied to the volatility proxy." />
          <Row k="Goal probability" v={`${A.MC_PATHS} random monthly return paths`} why="Share of paths reaching the target by the date. Normal returns, no fat tails." />
          <Row k="Emergency fund return" v={`${pct(A.EMERGENCY_RETURN, 1)}, volatility ${pct(A.EMERGENCY_VOL, 1)}`} why="Liquid-fund style assumption." />
          <Row k="Downside net worth" v={`Return − ${A.DOWNSIDE_K} × volatility`} why="A weak-market case, not a worst case." />
          <Row k="Retirement target (own numbers)" v={`${RETIREMENT.multiple}× annual spending at age ${RETIREMENT.age}`} why="The classic 4% withdrawal rule, ignoring inflation." />
        </Table>
        <Table title={`Return and volatility used for ${t.persona.name}'s holdings`} hint="Annual, illustrative; not forecasts">
          {t.holdings.map((h) => <Row key={h.symbol} k={h.name} v={`${pct(h.expectedReturn, 1)} return · ${pct(h.volatility, 1)} volatility`} why={`${h.assetClass} class default: ${pct(CLASS_DEFAULTS[h.assetClass].expectedReturn, 1)} / ${pct(CLASS_DEFAULTS[h.assetClass].volatility, 1)}`} />)}
        </Table>
        <Card><CardTitle hint="Please read">Limits and disclaimers</CardTitle>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-600">
            <li>Demo personas are fictional. Numbers you enter stay in a cookie on this device.</li>
            <li>No inflation, tax, fees or lump-sum events are modelled unless you simulate them.</li>
            <li>Past or assumed returns do not guarantee future results. This is education, not investment, tax or legal advice.</li>
            <li>The Copilot can only quote figures the engine produced; if an AI key is set it rewrites wording but is given the same data.</li>
          </ul></Card>
      </div>
    </>
  );
}
