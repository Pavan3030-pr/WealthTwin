import { computeTwinState } from "@/services/synthetic";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/RiskBadge";

export default function HomePage() {
  const twin = computeTwinState();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
              WT
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">WealthTwin</p>
              <p className="text-xs text-[var(--muted)]">Your Living Digital Finance Twin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 sm:inline-block">
              Synthetic data demo
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-[var(--muted)]">Demo twin for</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{twin.displayName}</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">All numbers below are synthetic and generated for this proof-of-concept.</p>
            </div>
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-center shadow-sm sm:mt-0">
              <p className="text-xs text-[var(--muted)]">Financial Health</p>
              <p className="text-3xl font-semibold text-[var(--primary)]">{twin.financialHealthScore}</p>
              <p className="text-xs text-[var(--muted)]">out of 100</p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader><CardTitle>Net Worth</CardTitle></CardHeader>
            <p className="text-2xl font-semibold">{formatCurrency(twin.netWorth, twin.currency, true)}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Portfolio + cash buffer</p>
          </Card>
          <Card>
            <CardHeader><CardTitle>Cashflow Health</CardTitle><RiskBadge level={twin.cashflowHealth} /></CardHeader>
            <p className="text-2xl font-semibold">{formatCurrency(twin.monthlyIncome - twin.monthlyExpense, twin.currency)}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Avg monthly surplus</p>
          </Card>
          <Card>
            <CardHeader><CardTitle>Portfolio Risk</CardTitle><RiskBadge level={twin.portfolioRisk} /></CardHeader>
            <p className="text-2xl font-semibold">{formatCurrency(twin.holdings.reduce((s, h) => s + h.value, 0), twin.currency, true)}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Invested assets</p>
          </Card>
          <Card>
            <CardHeader><CardTitle>Emergency Fund</CardTitle></CardHeader>
            <p className="text-2xl font-semibold">{twin.emergencyFundMonths.toFixed(1)} mo</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Target: 6 months</p>
          </Card>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Latest Insights</CardTitle></CardHeader>
            <ul className="space-y-4">
              {twin.insights.map((insight) => (
                <li key={insight.id} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                  <div className="mb-1 flex items-center gap-2">
                    <RiskBadge level={insight.severity} />
                    <span className="text-xs capitalize text-[var(--muted)]">{insight.category}</span>
                  </div>
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">{insight.body}</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recommended Actions</CardTitle></CardHeader>
            <ul className="space-y-4">
              {twin.recommendations.map((rec) => (
                <li key={rec.id} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{rec.description}</p>
                  {rec.impactEstimate && <p className="mt-2 text-xs font-medium text-[var(--primary)]">{rec.impactEstimate}</p>}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="mb-8">
          <Card>
            <CardHeader><CardTitle>Why this health score?</CardTitle></CardHeader>
            <p className="mb-4 text-sm text-[var(--muted)]">Every factor below is used by the twin engine. No black-box scores.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {twin.factors.map((f) => (
                <div key={f.id} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className={f.impact === "positive" ? "text-xs text-emerald-600" : f.impact === "negative" ? "text-xs text-red-600" : "text-xs text-[var(--muted)]"}>{f.impact}</span>
                  </div>
                  {f.detail && <p className="mt-1 text-xs text-[var(--muted)]">{f.detail}</p>}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Goals</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {twin.goals.map((goal) => (
              <Card key={goal.id}>
                <p className="text-sm font-medium">{goal.name}</p>
                <p className="mt-2 text-xl font-semibold">{formatPercent(goal.progress)}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                  <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(100, goal.progress * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">{formatCurrency(goal.currentAmount, twin.currency, true)} of {formatCurrency(goal.targetAmount, twin.currency, true)}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold">Portfolio Snapshot</h2>
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                  <th className="pb-2 font-medium">Asset</th>
                  <th className="pb-2 font-medium">Value</th>
                  <th className="pb-2 font-medium">Allocation</th>
                  <th className="pb-2 font-medium">Risk</th>
                </tr>
              </thead>
              <tbody>
                {twin.holdings.map((h) => (
                  <tr key={h.symbol} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5"><span className="font-medium">{h.name}</span> <span className="ml-2 text-xs text-[var(--muted)]">{h.symbol}</span></td>
                    <td className="py-2.5">{formatCurrency(h.value, twin.currency)}</td>
                    <td className="py-2.5">{formatPercent(h.allocation)}</td>
                    <td className="py-2.5"><RiskBadge level={h.risk} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <footer className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-900">
          <strong>Synthetic Data Notice:</strong> All user profiles, transactions, holdings and insights in this demonstration are artificially generated. No real financial data is collected or stored.
        </footer>
      </main>
    </div>
  );
}
