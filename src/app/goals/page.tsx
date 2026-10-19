import { computeTwinState } from "@/services/synthetic";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Nav } from "@/components/Nav";
import Link from "next/link";

export default function GoalsPage() {
  const twin = computeTwinState();

  const timeline = [
    { date: "2026-10", title: "Today", description: `Emergency fund at ${twin.emergencyFundMonths.toFixed(1)} months. Home goal ${formatPercent(twin.goals[1]?.progress ?? 0)}.`, status: "current" as const },
    { date: "2027-03", title: "Emergency fund target", description: "Projected reach of 6-month emergency fund if ₹8k/month auto-sweep is enabled.", status: "upcoming" as const },
    { date: "2028-06", title: "Home down-payment midpoint", description: "At current SIP + surplus, ~50% of home down-payment goal expected.", status: "upcoming" as const },
    { date: "2029-06", title: "Home down-payment goal", description: twin.goals[1] ? `Target ₹${(twin.goals[1].targetAmount / 100000).toFixed(1)}L` : "Home goal date", status: "upcoming" as const },
    { date: "2055-01", title: "Retirement horizon", description: twin.goals[2] ? `Long-term corpus target ₹${(twin.goals[2].targetAmount / 10000000).toFixed(1)} Cr` : "Retirement", status: "future" as const },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">WT</Link>
            <div>
              <p className="text-sm font-semibold tracking-tight">WealthTwin</p>
              <p className="text-xs text-[var(--muted)]">Goals & Timeline</p>
            </div>
          </div>
          <Nav active="/goals" />
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">Synthetic data demo</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Goals & Timeline</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Progress and projected milestones for {twin.displayName}. Synthetic projections only.</p>
        </div>

        <section className="mb-10 grid gap-4 sm:grid-cols-3">
          {twin.goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader><CardTitle>{goal.name}</CardTitle></CardHeader>
              <p className="text-2xl font-semibold">{formatPercent(goal.progress)}</p>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${Math.min(100, goal.progress * 100)}%` }} />
              </div>
              <div className="mt-3 flex justify-between text-xs text-[var(--muted)]">
                <span>{formatCurrency(goal.currentAmount, twin.currency, true)}</span>
                <span>{formatCurrency(goal.targetAmount, twin.currency, true)}</span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">Target date: {goal.targetDate}</p>
            </Card>
          ))}
        </section>

        <section className="mb-10">
          <h2 className="mb-6 text-lg font-semibold">Projected Timeline</h2>
          <div className="relative space-y-0 pl-6 sm:pl-8">
            <div className="absolute bottom-2 left-[11px] top-2 w-0.5 bg-[var(--border)] sm:left-[15px]" />
            {timeline.map((item, idx) => (
              <div key={idx} className="relative pb-8 last:pb-0">
                <div className={`absolute left-[-17px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 sm:left-[-21px] sm:h-5 sm:w-5 ${
                  item.status === "current" ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)] bg-[var(--surface)]"
                }`}>
                  {item.status === "current" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-[var(--primary)]">{item.date}</span>
                    {item.status === "current" && <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">Now</span>}
                  </div>
                  <p className="mt-1 font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-900">
          <strong>Synthetic Data Notice:</strong> Timeline projections are illustrative and based on synthetic assumptions.
        </footer>
      </main>
    </div>
  );
}
