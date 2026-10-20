import Link from "next/link";
import { ArrowRight, BookOpen, LineChart, ShieldCheck, SlidersHorizontal, Sparkles, Target } from "lucide-react";
import { Brand } from "@/components/layout/app-shell";
import { ScoreRing } from "@/components/twin/score-ring";
import { SyntheticBadge } from "@/components/ui/badges";

const FEATURES = [
  { icon: LineChart, title: "Cashflow stress forecast", body: "See the exact day your balance may run thin, 90 days ahead, with a likely range." },
  { icon: ShieldCheck, title: "Explainable health score", body: "Five weighted factors, each with the reason behind its points. No black box." },
  { icon: SlidersHorizontal, title: "What-if simulator", body: "Test a raise, a market crash or a medical bill before it happens." },
  { icon: Target, title: "Goal probability", body: "Monte Carlo odds for each goal, plus the monthly amount that fixes the gap." },
  { icon: Sparkles, title: "AI Copilot", body: "Ask “can I afford this?” and get an answer grounded in your own forecast." },
  { icon: BookOpen, title: "Learning in context", body: "Short lessons that explain concepts using your numbers, not textbook ones." },
];

export default function Landing() {
  return (
    <div className="bg-wash relative min-h-screen overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[560px]" aria-hidden="true" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Brand />
        <div className="flex items-center gap-3"><SyntheticBadge /><Link href="/dashboard" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">Open demo</Link></div>
      </header>

      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
        <div className="animate-rise">
          <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-slate-200">Built for Mochavate · Mochatrade Product Innovation Challenge</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">Your money, <span className="bg-gradient-to-r from-teal-600 to-sky-500 bg-clip-text text-transparent">one step ahead.</span></h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">WealthTwin is a living digital twin of your finances. It forecasts cashflow stress before it happens, explains your financial health, simulates decisions, and teaches using your own numbers.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700">Explore the twin <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/simulator" className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50">Try the simulator</Link>
            <Link href="/my-numbers" className="inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50">Use my own numbers</Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">Three synthetic personas: salaried, freelancer, and a family with a home loan.</p>
        </div>

        <div className="animate-rise relative" style={{ animationDelay: "120ms" }}>
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.25)]">
            <div className="flex items-center gap-6">
              <ScoreRing score={77} size={132} />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-slate-900">Aarav, 26</p>
                <p className="text-slate-500">Runway 2.8 months</p>
                <p className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Next 90 days: comfortable</p>
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              {[["Cashflow forecast", "Low point ₹83k on 31 Oct"], ["Goal: Home down payment", "81% chance on time"], ["Copilot", "“Yes, ₹40,000 fits your plan.”"]].map(([a, b]) => (
                <div key={a} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="font-medium text-slate-800">{a}</span><span className="text-slate-500">{b}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-slate-500">All data is synthetic. Educational use only, not investment advice.</p>
      </section>
    </div>
  );
}
