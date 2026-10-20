import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { getTwin } from "@/lib/twin-session";
import { Card, CardTitle, PageHeader } from "@/components/ui/surface";
import { RiskBadge } from "@/components/ui/badges";

export default async function InsightsPage() {
  const t = await getTwin();
  return (
    <>
      <PageHeader eyebrow="Insights & alerts" title="What your twin noticed" subtitle="Every alert is generated from your numbers and links to the evidence." />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {t.insights.map((i) => {
            const Icon = i.severity === "high" ? AlertTriangle : i.severity === "medium" ? Info : CheckCircle2;
            const tone = i.severity === "high" ? "text-rose-600 bg-rose-50" : i.severity === "medium" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";
            return (
              <Card key={i.id} className="flex gap-4">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-semibold text-slate-900">{i.title}</h2><RiskBadge level={i.severity} suffix="" /></div>
                  <p className="mt-1 text-sm text-slate-600">{i.body}</p>
                  {i.href && <Link href={i.href} className="mt-2 inline-block text-sm font-medium text-teal-700 hover:underline">View evidence</Link>}
                </div>
              </Card>
            );
          })}
        </div>
        <Card className="h-fit">
          <CardTitle hint="How your score is built, point by point">Contributing factors (explainability)</CardTitle>
          <div className="mb-4 flex items-baseline gap-2"><span className="num text-4xl font-semibold">{t.score}</span><span className="text-sm text-slate-500">/ 100 · {t.grade}</span></div>
          <ul className="space-y-4">
            {t.factors.map((f) => (
              <li key={f.id}>
                <div className="flex justify-between text-sm"><span className="font-medium text-slate-800">{f.label}</span><span className="num text-slate-500">{f.points} / {f.max}</span></div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${f.impact === "positive" ? "bg-emerald-500" : f.impact === "negative" ? "bg-rose-400" : "bg-amber-400"}`} style={{ width: `${(f.points / f.max) * 100}%` }} /></div>
                <p className="mt-1 text-xs text-slate-500">{f.detail}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
