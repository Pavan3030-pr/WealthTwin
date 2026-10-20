import { getTwin } from "@/lib/twin-session";
import { PrintButton } from "@/components/ui/print-button";
import { ScoreRing } from "@/components/twin/score-ring";
import { ForecastSvg } from "@/components/charts/forecast-svg";
import { adaptiveSip, nextBestAction, safeToSpend } from "@/services/advisor";
import { fmtDate, inr, pct } from "@/lib/utils";

export const metadata = { title: "WealthTwin report" };

export default async function ReportPage() {
  const t = await getTwin();
  const action = nextBestAction(t);
  const sts = safeToSpend(t);
  const sip = adaptiveSip(t);
  const kpis = [
    ["Net worth", inr(t.netWorth, true)], ["Monthly surplus", inr(t.monthlySurplus, true)], ["Savings rate", pct(t.savingsRate)],
    ["Runway", `${t.emergencyMonths.toFixed(1)} months`], ["Safe to spend (30d)", inr(sts.headroom, true)], ["Lowest balance (90d)", inr(t.stress.minBalance, true)],
  ];
  return (
    <div className="mx-auto max-w-[820px] space-y-4 text-[13px] text-slate-700 print:max-w-none print:space-y-3 print:text-[11px]">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Twin report</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">One page, ready to share</h1><p className="mt-1 text-sm text-slate-500">Use your browser&apos;s print dialog and choose “Save as PDF”.</p></div>
        <PrintButton />
      </div>

      <article className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm print:space-y-3 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 print:pb-3">
          <div>
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-bold text-white">W</span><span className="text-base font-semibold text-slate-900">WealthTwin report</span></div>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">{t.persona.name}</h2>
            <p className="text-slate-500">{t.persona.role} · age {t.persona.age} · {t.persona.city}</p>
            <p className="mt-0.5 text-slate-400">Generated {fmtDate(t.asOf, { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-3"><ScoreRing score={t.score} size={96} /><div><p className="text-[11px] uppercase tracking-wider text-slate-400">Health</p><p className="text-lg font-semibold text-slate-900">{t.grade}</p></div></div>
        </header>

        <section className="grid grid-cols-3 gap-3 break-inside-avoid">
          {kpis.map(([k, v]) => (<div key={k} className="rounded-xl bg-slate-50 px-3 py-2.5 print:bg-white print:ring-1 print:ring-slate-200"><p className="text-[11px] text-slate-500">{k}</p><p className="num text-base font-semibold text-slate-900">{v}</p></div>))}
        </section>

        <section className="break-inside-avoid">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Next 90 days</h3>
          <ForecastSvg data={t.forecast} floor={t.safetyFloor} />
          <p className="mt-1 text-slate-500">{t.stress.firstStressDate ? `Balance is projected to fall below the safety floor from ${fmtDate(t.stress.firstStressDate)}; downside low ${inr(t.stress.pessimisticMin)}.` : `Balance stays above the safety floor. Downside low ${inr(t.stress.pessimisticMin)}.`}</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 print:grid-cols-2 break-inside-avoid">
          <div className="rounded-xl bg-teal-50/60 p-3.5 ring-1 ring-teal-600/10 print:bg-white print:ring-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">Next best action</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{action.title}</p>
            <p className="mt-1">{action.body}</p>
            {action.stat && <p className="num mt-1.5 font-medium text-slate-900">{action.stat.label}: {action.stat.from} → {action.stat.to}</p>}
          </div>
          <div className="rounded-xl p-3.5 ring-1 ring-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Adaptive SIP</p>
            <p className="num mt-1 text-sm font-semibold text-slate-900">{inr(sip.suggested)} / month <span className="font-normal text-slate-400">(now {inr(sip.current)})</span></p>
            <p className="mt-1">{sip.reason}</p>
          </div>
        </section>

        <section className="break-inside-avoid">
          <h3 className="mb-1.5 text-sm font-semibold text-slate-900">Health score breakdown</h3>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
            {t.factors.map((f) => (<li key={f.id} className="flex justify-between gap-3"><span>{f.label}</span><span className="num font-medium text-slate-900">{f.points}/{f.max}</span></li>))}
          </ul>
        </section>

        <section className="break-inside-avoid">
          <h3 className="mb-1.5 text-sm font-semibold text-slate-900">Goals</h3>
          <table className="w-full text-left"><thead><tr className="text-[11px] text-slate-500"><th className="pb-1 font-medium">Goal</th><th className="pb-1 text-right font-medium">Progress</th><th className="pb-1 text-right font-medium">Finish</th><th className="pb-1 text-right font-medium">Chance on time</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{t.goals.map((g) => (<tr key={g.id}><td className="py-1.5">{g.name}</td><td className="num py-1.5 text-right">{pct(g.progress)} of {inr(g.targetAmount, true)}</td><td className="num py-1.5 text-right">{g.etaDate ? fmtDate(g.etaDate, { month: "short", year: "numeric" }) : "50+ yrs"}</td><td className="num py-1.5 text-right font-medium text-slate-900">{pct(g.probability)}</td></tr>))}</tbody></table>
        </section>

        <section className="break-inside-avoid">
          <h3 className="mb-1.5 text-sm font-semibold text-slate-900">What the twin noticed</h3>
          <ul className="space-y-1">{t.insights.slice(0, 4).map((i) => (<li key={i.id}><span className="font-medium text-slate-900">{i.title}.</span> {i.body}</li>))}</ul>
        </section>

        <footer className="border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
          Built for Mochavate by Mochatrade. Illustrative model: {t.persona.id === "custom" ? "figures come from the numbers you entered" : "figures are synthetic"}; returns, volatility and rules are listed on the Assumptions page. Educational use only. Not investment, tax or legal advice.
        </footer>
      </article>
    </div>
  );
}
