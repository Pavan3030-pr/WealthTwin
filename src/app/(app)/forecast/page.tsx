import { getTwin } from "@/lib/twin-session";
import { Card, CardTitle, PageHeader } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/badges";
import { ForecastChart } from "@/components/charts/forecast-chart";
import { fmtDate, inr } from "@/lib/utils";

export default async function ForecastPage() {
  const t = await getTwin();
  const events = t.forecast.filter((p) => p.events.length).slice(0, 14);
  return (
    <>
      <PageHeader eyebrow="Cashflow forecast" title="Your next 90 days, before they happen" subtitle="Bills, SIPs and income are projected day by day. The shaded band shows a pessimistic-to-optimistic range." right={<RiskBadge level={t.cashflowHealth} suffix="stress" />} />
      <div className="mb-5 grid gap-4 sm:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Lowest balance</p><p className="num mt-1 text-xl font-semibold">{inr(t.stress.minBalance)}</p><p className="text-xs text-slate-400">{fmtDate(t.stress.minDate)}</p></Card>
        <Card><p className="text-xs text-slate-500">Downside low</p><p className="num mt-1 text-xl font-semibold">{inr(t.stress.pessimisticMin)}</p><p className="text-xs text-slate-400">if income lands lower</p></Card>
        <Card><p className="text-xs text-slate-500">Safety floor</p><p className="num mt-1 text-xl font-semibold">{inr(t.safetyFloor)}</p><p className="text-xs text-slate-400">10 days of spending</p></Card>
        <Card><p className="text-xs text-slate-500">Days below floor</p><p className="num mt-1 text-xl font-semibold">{t.stress.daysBelowFloor}</p><p className="text-xs text-slate-400">{t.stress.firstStressDate ? `from ${fmtDate(t.stress.firstStressDate)}` : "none projected"}</p></Card>
      </div>
      <Card>
        <CardTitle hint="Amber line marks your safety floor">Projected cash balance</CardTitle>
        <ForecastChart data={t.forecast} floor={t.safetyFloor} />
      </Card>
      <Card className="mt-5">
        <CardTitle hint="The next scheduled cash movements">Upcoming events</CardTitle>
        <ul className="divide-y divide-slate-100">
          {events.map((p) => (
            <li key={p.date} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm first:pt-0 last:pb-0">
              <span className="w-24 font-medium text-slate-900">{fmtDate(p.date, { weekday: "short", day: "numeric", month: "short" })}</span>
              <span className="flex-1 text-slate-600">{p.events.join(" · ")}</span>
              <span className="num text-slate-500">{inr(p.expected)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
