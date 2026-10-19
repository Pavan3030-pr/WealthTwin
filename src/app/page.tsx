import { computeTwinState } from "@/services/synthetic";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { CashflowChart } from "@/components/charts/CashflowChart";
import { Nav } from "@/components/Nav";
import Link from "next/link";

export default function HomePage() {
  const twin = computeTwinState();

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
              WT
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-stone-900">WealthTwin</p>
              <p className="text-xs text-stone-500">Your Living Digital Finance Twin</p>
            </div>
          </div>
          <Nav active="/" />
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
            Synthetic data demo
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-stone-500">Demo twin for</p>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                {twin.displayName}
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                All numbers below are synthetic and generated for this proof-of-concept.
              </p>
            </div>
            <div className="mt-4 rounded-2xl border border-stone-200 bg-white px-5 py-3 text-center shadow-sm sm:mt-0">
              <p className="text-xs text-stone-500">Financial Health</p>
              <p className="text-3xl font-semibold text-teal-600">{twin.financialHealthScore}</p>
              <p className="text-xs text-stone-500">out of 100</p>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader><CardTitle>Net Worth</CardTitle></CardHeader>
            <p className="text-2xl font-semibold text-stone-900">
              {formatCurrency(twin.netWorth, twin.currency, true)}
            </p>
            <p className="mt-1 text-xs text-stone-500">Portfolio + cash buffer</p>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cashflow Health</CardTitle>
              <RiskBadge level={twin.cashflowHealth} />
            </CardHeader>
            <p className="text-2xl font-semibold text-stone-900">
              {formatCurrency(twin.monthlyIncome - twin.monthlyExpense, twin.currency)}
            </p>
            <p className="mt-1 text-xs text-stone-500">Avg monthly surplus</p>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Risk</CardTitle>
              <RiskBadge level={twin.portfolioRisk} />
            </CardHeader>
            <p className="text-2xl font-semibold text-stone-900">
              {formatCurrency(twin.holdings.reduce((s, h) => s + h.value, 0), twin.currency, true)}
            </p>
            <p className="mt-1 text-xs text-stone-500">Invested assets</p>
          </Card>
          <Card>
            <CardHeader><CardTitle>Emergency Fund</CardTitle></CardHeader>
            <p className="text-2xl font-semibold text-stone-900">
              {twin.emergencyFundMonths.toFixed(1)} mo
            </p>
            <p className="mt-1 text-xs text-stone-500">Target: 6 months</p>
          </Card>
        </section>

        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Cashflow (last 6 months)</CardTitle>
              <Link href="/insights" className="text-xs font-medium text-teal-600 hover:underline">
                View insights →
              </Link>
            </CardHeader>
            <CashflowChart data={twin.cashflowSeries} />
          </Card>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Latest Insights</CardTitle>
              <Link href="/insights" className="text-xs font-medium text-teal-600 hover:underline">
                See all →
              </Link>
            </CardHeader>
            <ul className="space-y-4">
              {twin.insights.slice(0, 2).map((insight) => (
                <li key={insight.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                  <div className="mb-1 flex items-center gap-2">
                    <RiskBadge level={insight.severity} />
                    <span className="text-xs capitalize text-stone-500">{insight.category}</span>
                  </div>
                  <p className="text-sm font-medium text-stone-900">{insight.title}</p>
                  <p className="mt-0.5 text-sm text-stone-500">{insight.body}</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recommended Actions</CardTitle></CardHeader>
            <ul className="space-y-4">
              {twin.recommendations.slice(0, 2).map((rec) => (
                <li key={rec.id} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                  <p className="text-sm font-medium text-stone-900">{rec.title}</p>
                  <p className="mt-1 text-sm text-stone-500">{rec.description}</p>
                  {rec.impactEstimate && (
                    <p className="mt-2 text-xs font-medium text-teal-600">{rec.impactEstimate}</p>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Goals</h2>
            <Link href="/goals" className="text-sm font-medium text-teal-600 hover:underline">
              Timeline →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {twin.goals.map((goal) => (
              <Card key={goal.id}>
                <p className="text-sm font-medium text-stone-900">{goal.name}</p>
                <p className="mt-2 text-xl font-semibold text-stone-900">{formatPercent(goal.progress)}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-teal-600"
                    style={{ width: `${Math.min(100, goal.progress * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  {formatCurrency(goal.currentAmount, twin.currency, true)} of{" "}
                  {formatCurrency(goal.targetAmount, twin.currency, true)}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <Card>
            <CardHeader><CardTitle>Why this health score?</CardTitle></CardHeader>
            <p className="mb-4 text-sm text-stone-500">
              Every factor below is used by the twin engine. No black-box scores.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {twin.factors.map((f) => (
                <div key={f.id} className="rounded-xl border border-stone-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-900">{f.label}</span>
                    <span
                      className={
                        f.impact === "positive"
                          ? "text-xs text-emerald-600"
                          : f.impact === "negative"
                            ? "text-xs text-red-600"
                            : "text-xs text-stone-500"
                      }
                    >
                      {f.impact}
                    </span>
                  </div>
                  {f.detail && <p className="mt-1 text-xs text-stone-500">{f.detail}</p>}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <footer className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-900">
          <strong>Synthetic Data Notice:</strong> All user profiles, transactions,
          holdings and insights in this demonstration are artificially generated.
          No real financial data is collected or stored.
        </footer>
      </main>
    </div>
  );
}
