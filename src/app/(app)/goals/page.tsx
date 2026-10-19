import { getTwin } from "@/lib/twin-session";
import { Card, CardTitle, PageHeader } from "@/components/ui/card";
import { Delta } from "@/components/ui/badges";
import { fmtDate, inr, pct } from "@/lib/utils";

export default async function GoalsPage() {
  const t = await getTwin();
  return (
    <>
      <PageHeader eyebrow="Goals" title="Goals and probability of success" subtitle="Each goal is projected with 300 random market paths. Probability is the share of paths that reach the target on time." />
      <div className="space-y-4">
        {t.goals.map((g) => (
          <Card key={g.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">{g.name}</h2>
                <p className="mt-0.5 text-xs text-slate-500">Target {inr(g.targetAmount, true)} by {fmtDate(g.targetDate, { month: "short", year: "numeric" })} · {inr(g.monthly)}/month</p>
              </div>
              <Delta value={g.onTrack ? "On track" : "Behind"} good={g.onTrack} />
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(g.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${g.name} progress`}>
              <div className={`h-full rounded-full ${g.onTrack ? "bg-teal-600" : "bg-amber-500"}`} style={{ width: `${Math.max(2, g.progress * 100)}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div><p className="text-xs text-slate-500">Saved</p><p className="num font-semibold">{inr(g.currentAmount, true)} <span className="font-normal text-slate-400">({pct(g.progress)})</span></p></div>
              <div><p className="text-xs text-slate-500">Projected finish</p><p className="num font-semibold">{g.etaDate ? fmtDate(g.etaDate, { month: "short", year: "numeric" }) : "50+ years"}</p></div>
              <div><p className="text-xs text-slate-500">Chance on time</p><p className="num font-semibold">{pct(g.probability)}</p></div>
              <div><p className="text-xs text-slate-500">Needed per month</p><p className="num font-semibold">{inr(Math.ceil(g.requiredMonthly / 500) * 500)}</p></div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-5">
        <CardTitle hint="Base case vs a weak-market case (return minus 0.8× volatility)">Net worth, next five years</CardTitle>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-slate-500"><th className="pb-2 font-medium">Year</th><th className="pb-2 text-right font-medium">Base</th><th className="pb-2 text-right font-medium">Downside</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{t.projection.map((p) => <tr key={p.year}><td className="py-2">{p.year}</td><td className="num py-2 text-right font-medium">{inr(p.base, true)}</td><td className="num py-2 text-right text-slate-500">{inr(p.downside, true)}</td></tr>)}</tbody>
        </table>
      </Card>
    </>
  );
}
