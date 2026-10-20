import Link from "next/link";
import { ArrowRight, Award, Flame, Sparkles, TrendingUp } from "lucide-react";
import { getTwin } from "@/lib/twin-session";
import { Card, CardTitle } from "@/components/ui/surface";
import { RiskBadge } from "@/components/ui/badges";
import { ScoreRing } from "@/components/twin/score-ring";
import { SafeToSpend } from "@/components/twin/safe-to-spend";
import { Sparkline } from "@/components/charts/sparkline";
import { HistoryChart } from "@/components/charts/history-chart";
import { AllocationDonut } from "@/components/charts/allocation-donut";
import { adaptiveSip, briefing, fitness, nextBestAction, safeToSpend } from "@/services/advisor";
import { DONUT_COLORS, cn, fmtDate, inr, pct } from "@/lib/utils";

const TONE = {
  alert: "from-rose-50 via-white to-amber-50 ring-rose-200/70",
  focus: "from-teal-50 via-white to-sky-50 ring-teal-200/70",
  good: "from-emerald-50 via-white to-teal-50 ring-emerald-200/70",
} as const;

export default async function Dashboard() {
  const t = await getTwin();
  const action = nextBestAction(t);
  const sts = safeToSpend(t);
  const sip = adaptiveSip(t);
  const fit = fitness(t);
  const spendTotal = t.spending.reduce((s, x) => s + x.amount, 0);
  const earned = fit.badges.filter((b) => b.earned).length;

  return (
    <>
      <div className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 ring-1 sm:p-8", TONE[action.tone])}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{t.persona.role} · {t.persona.city} · Today&apos;s briefing</p>
        <h1 className="mt-2 max-w-3xl text-2xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-[32px]">{briefing(t)}</h1>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />{action.eyebrow} · Next best action</p>
            <h2 className="mt-1.5 text-lg font-semibold text-slate-900">{action.title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{action.body}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Link href={action.href} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">{action.cta}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              {action.stat && (
                <div className="flex items-center gap-2 text-sm"><span className="text-slate-500">{action.stat.label}</span><span className="num text-slate-400 line-through">{action.stat.from}</span><ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /><span className="num font-semibold text-emerald-700">{action.stat.to}</span></div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
            <ScoreRing score={t.score} size={104} />
            <div><p className="text-xs text-slate-500">Financial health</p><p className="text-lg font-semibold text-slate-900">{t.grade}</p><Link href="/insights" className="text-xs font-medium text-teal-700 hover:underline">Why this score</Link></div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-xs text-slate-500">Net worth</p><p className="num mt-1 text-2xl font-semibold">{inr(t.netWorth, true)}</p><div className="mt-2 flex items-center justify-between"><span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><TrendingUp className="h-3 w-3" aria-hidden="true" />{inr(t.projection[1].base - t.projection[0].base, true)} /yr</span><Sparkline values={t.projection.map((p) => p.base)} /></div></Card>
        <Card><p className="text-xs text-slate-500">Monthly surplus</p><p className="num mt-1 text-2xl font-semibold">{inr(t.monthlySurplus, true)}</p><div className="mt-2 flex items-center justify-between"><span className="text-xs text-slate-500">{pct(t.savingsRate)} saved</span><Sparkline values={t.history.map((h) => h.net)} color="#38bdf8" /></div></Card>
        <Card><p className="text-xs text-slate-500">Emergency runway</p><p className="num mt-1 text-2xl font-semibold">{t.emergencyMonths.toFixed(1)} <span className="text-base font-medium text-slate-400">months</span></p><div className="mt-2"><RiskBadge level={t.emergencyMonths >= 5 ? "low" : t.emergencyMonths >= 3 ? "medium" : "high"} text={t.emergencyMonths >= 5 ? "Strong buffer" : t.emergencyMonths >= 3 ? "Adequate buffer" : "Thin buffer"} /></div></Card>
        <Card><p className="text-xs text-slate-500">Lowest balance, 90 days</p><p className="num mt-1 text-2xl font-semibold">{inr(t.stress.minBalance, true)}</p><div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1"><RiskBadge level={t.cashflowHealth} suffix="stress" /><span className="text-xs text-slate-400">{fmtDate(t.stress.minDate)}</span></div></Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <SafeToSpend headroom={sts.headroom} perDay={sts.perDay} minBalance90={sts.minBalance90} floor={sts.floor} />
        <Card>
          <CardTitle hint="SIP that adapts to your cashflow outlook">Adaptive SIP</CardTitle>
          <div className="flex items-baseline gap-2"><span className="num text-3xl font-semibold tracking-tight">{inr(sip.suggested)}</span><span className="text-sm text-slate-400">/ month</span></div>
          <p className="mt-1 text-xs text-slate-500">Now {inr(sip.current)} · <span className={cn("font-semibold", sip.tone === "reduce" ? "text-rose-600" : sip.tone === "raise" ? "text-emerald-600" : "text-slate-600")}>{sip.tone === "reduce" ? "Temporarily reduce" : sip.tone === "raise" ? "Room to raise" : "Hold steady"}</span></p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{sip.reason}</p>
          {sip.effect && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200/70">{sip.effect}</p>}
        </Card>
        <Card>
          <CardTitle hint={`${earned} of ${fit.badges.length} badges earned`} right={<Award className="h-5 w-5 text-amber-500" aria-hidden="true" />}>Fitness level</CardTitle>
          <div className="flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500" aria-hidden="true" /><span className="text-2xl font-semibold tracking-tight">{fit.level}</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(fit.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level"><div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-sky-400" style={{ width: `${Math.max(4, fit.progress * 100)}%` }} /></div>
          <p className="mt-1.5 text-xs text-slate-500">{fit.next ? `${fit.toNext} points to ${fit.next}` : "Top level reached"}</p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {fit.badges.map((b) => (
              <li key={b.id} title={b.hint} className={cn("rounded-xl px-2.5 py-2 text-xs ring-1", b.earned ? "bg-teal-50 font-medium text-teal-800 ring-teal-600/15" : "bg-slate-50 text-slate-400 ring-slate-200")}>{b.label}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardTitle hint="Last six months" right={<Link href="/forecast" className="text-sm font-medium text-teal-700 hover:underline">Open forecast</Link>}>Income, spending and savings</CardTitle>
          <HistoryChart data={t.history} />
        </Card>
        <Card>
          <CardTitle hint="Five weighted factors, all explainable">Score breakdown</CardTitle>
          <ul className="space-y-3">
            {t.factors.map((f) => (
              <li key={f.id}>
                <div className="flex justify-between text-sm"><span className="text-slate-700">{f.label}</span><span className="num text-slate-400">{f.points}/{f.max}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${f.impact === "positive" ? "bg-emerald-500" : f.impact === "negative" ? "bg-rose-400" : "bg-amber-400"}`} style={{ width: `${(f.points / f.max) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle hint="Average monthly, by category">Where your money goes</CardTitle>
          <div className="flex flex-wrap items-center gap-6">
            <AllocationDonut data={t.spending.map((s) => ({ name: s.category, value: s.amount }))} centerLabel="per month" centerValue={inr(spendTotal, true)} />
            <ul className="min-w-[180px] flex-1 space-y-2 text-sm">
              {t.spending.map((s, i) => (
                <li key={s.category} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />{s.category}</span><span className="num text-slate-900">{inr(s.amount)}</span></li>
              ))}
            </ul>
          </div>
        </Card>
        <Card>
          <CardTitle hint="Prioritised by your own numbers">More ways to improve</CardTitle>
          <ul className="space-y-3">
            {t.recommendations.map((r) => (
              <li key={r.id}>
                <Link href={r.href} className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 p-3.5 transition hover:border-teal-600/40 hover:bg-teal-50/40">
                  <div><p className="text-sm font-semibold text-slate-900">{r.title}</p><p className="mt-0.5 text-xs text-slate-500">{r.description}</p></div>
                  <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-medium text-teal-700">{r.cta}<ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
