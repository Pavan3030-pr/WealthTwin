import { computeTwinState } from "@/services/synthetic";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Nav } from "@/components/Nav";
import Link from "next/link";

export default function InsightsPage() {
  const twin = computeTwinState();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">WT</Link>
            <div>
              <p className="text-sm font-semibold tracking-tight">WealthTwin</p>
              <p className="text-xs text-[var(--muted)]">Insights detail</p>
            </div>
          </div>
          <Nav active="/insights" />
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">Synthetic data demo</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Insights & Alerts</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Explainable signals generated from {twin.displayName}&apos;s twin state. All data is synthetic.</p>
        </div>

        <div className="mb-8 grid gap-4">
          {twin.insights.map((insight) => (
            <Card key={insight.id}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <RiskBadge level={insight.severity} />
                <span className="rounded-full bg-[var(--border)] px-2 py-0.5 text-xs capitalize text-[var(--muted)]">{insight.category}</span>
                <span className="text-xs text-[var(--muted)]">{new Date(insight.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <h2 className="text-lg font-medium">{insight.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{insight.body}</p>
            </Card>
          ))}
        </div>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Recommended Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {twin.recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader><CardTitle>{rec.title}</CardTitle></CardHeader>
                <p className="text-sm text-[var(--muted)]">{rec.description}</p>
                {rec.impactEstimate && <p className="mt-3 text-xs font-medium text-[var(--primary)]">{rec.impactEstimate}</p>}
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <Card>
            <CardHeader><CardTitle>Contributing factors (explainability)</CardTitle></CardHeader>
            <p className="mb-4 text-sm text-[var(--muted)]">These factors directly influence the Financial Health Score of {twin.financialHealthScore}/100.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {twin.factors.map((f) => (
                <div key={f.id} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className={f.impact === "positive" ? "text-xs text-emerald-600" : f.impact === "negative" ? "text-xs text-red-600" : "text-xs text-[var(--muted)]"}>
                      {f.impact} · weight {(f.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                  {f.detail && <p className="mt-1 text-xs text-[var(--muted)]">{f.detail}</p>}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <footer className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-900">
          <strong>Synthetic Data Notice:</strong> All insights and recommendations are generated from synthetic twin data.
        </footer>
      </main>
    </div>
  );
}
