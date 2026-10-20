import Link from "next/link";
import { AlertTriangle, ArrowRight, Brain, Building2, CheckCircle2, Rocket, Users } from "lucide-react";
import { Card, PageHeader } from "@/components/ui/card";

const CRITERIA = [
  ["Relevance and impact", "Turns reactive money management into proactive planning for people who feel it most: freelancers, first-jobbers, single-income families."],
  ["Innovation", "One twin that predicts, explains, simulates and teaches, instead of four disconnected tools."],
  ["AI integration", "Monte Carlo goal odds, stress forecasting, a Copilot grounded in the twin, adaptive SIP logic. AI never invents numbers; it explains the engine's."],
  ["Technical execution", "Deterministic TypeScript engine shared by server and browser, tested, rate-limited API, graceful fallback without any key."],
  ["Feasibility and scale", "Plugs into India's Account Aggregator rails for real data. Embeddable by brokers, neobanks and employers."],
  ["Presentation", "Three personas, a four-minute demo path, and every number traceable to its factor."],
];

export default function PitchPage() {
  return (
    <>
      <PageHeader eyebrow="Pitch" title="Why WealthTwin wins" subtitle="The story for the Mochavate finale, mapped to the criteria hackathon judges score." right={<Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Start live demo <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="h-5 w-5" aria-hidden="true" /></span><h2 className="mt-3 text-base font-semibold">The problem</h2><p className="mt-1.5 text-sm leading-relaxed text-slate-600">People learn about a cash crunch when the balance hits zero. They cannot tell if a purchase is safe, and generic financial education never mentions their own numbers.</p></Card>
        <Card><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Brain className="h-5 w-5" aria-hidden="true" /></span><h2 className="mt-3 text-base font-semibold">The product</h2><p className="mt-1.5 text-sm leading-relaxed text-slate-600">A living digital twin of income, bills, investments and goals. It forecasts stress 90 days out, scores health transparently, and answers “can I afford this?” in seconds.</p></Card>
        <Card><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Users className="h-5 w-5" aria-hidden="true" /></span><h2 className="mt-3 text-base font-semibold">Who it is for</h2><p className="mt-1.5 text-sm leading-relaxed text-slate-600">Salaried early-career users, freelancers with lumpy income, and families carrying home loans and school fees. All three are in the demo.</p></Card>
      </div>

      <Card className="mt-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900">How it maps to judging criteria</h2>
        <ul className="divide-y divide-slate-100">
          {CRITERIA.map(([k, v]) => (
            <li key={k} className="flex gap-3 py-3 first:pt-0 last:pb-0"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" /><div><p className="text-sm font-semibold text-slate-900">{k}</p><p className="text-sm text-slate-600">{v}</p></div></li>
          ))}
        </ul>
      </Card>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Card><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Building2 className="h-5 w-5" aria-hidden="true" /></span><h2 className="mt-3 text-base font-semibold">Business model</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600"><li>B2B2C: embed the twin in broker and neobank apps to lift SIP activation and retention.</li><li>Consumer premium: household and family planning, tax-aware simulation.</li><li>Employer wellness: white-label financial education tied to salary cycles.</li></ul></Card>
        <Card><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><Rocket className="h-5 w-5" aria-hidden="true" /></span><h2 className="mt-3 text-base font-semibold">Roadmap</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600"><li>Next: Account Aggregator data instead of synthetic transactions.</li><li>Then: pre-payment risk checks and goal-based SIP automation with partner brokers.</li><li>Later: regulated advisory partnership and family twin.</li></ul></Card>
      </div>
      <p className="mt-6 text-xs text-slate-400">Synthetic data. Educational demo, not investment advice.</p>
    </>
  );
}
