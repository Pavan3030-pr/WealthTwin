import Link from "next/link";
import { NavLinks } from "./sidebar";
import { PersonaSwitcher } from "./persona-switcher";
import { SyntheticBadge } from "@/components/ui/badges";
import { CommandMenu } from "./command-menu";
import type { PersonaId } from "@/types/twin";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="WealthTwin home">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-bold text-white shadow-sm">W</span>
      <span>
        <span className="block text-[15px] font-semibold leading-tight tracking-tight text-slate-900">WealthTwin</span>
        <span className="block text-[11px] leading-tight text-slate-500">Living finance twin</span>
      </span>
    </Link>
  );
}

export function AppShell({ persona, children }: { persona: PersonaId; children: React.ReactNode }) {
  return (
    <div className="bg-wash min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white/80 p-4 backdrop-blur lg:flex">
        <div className="px-1 pb-5 pt-1"><Brand /></div>
        <NavLinks orientation="vertical" />
        <div className="mt-auto space-y-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Demo persona</p>
          <PersonaSwitcher current={persona} />
          <p className="px-1 text-[11px] leading-snug text-slate-400">Educational demo. Not investment advice. All figures are synthetic.</p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3"><Brand /><SyntheticBadge /></div>
        <NavLinks orientation="horizontal" />
      </header>

      <div className="lg:pl-64">
        <div className="hidden items-center justify-between gap-4 px-8 pt-5 lg:flex"><CommandMenu /><SyntheticBadge /></div>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:pt-3">
          <div className="mb-5 space-y-3 lg:hidden"><CommandMenu /><PersonaSwitcher current={persona} /></div>
          <div className="animate-rise">{children}</div>
        </main>
      </div>
    </div>
  );
}
