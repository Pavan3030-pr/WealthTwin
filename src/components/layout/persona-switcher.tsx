"use client";
import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calculator } from "lucide-react";
import { setPersona } from "@/lib/persona-actions";
import { PERSONAS, PERSONA_IDS } from "@/services/personas";
import type { PersonaId } from "@/types/twin";
import { cn } from "@/lib/utils";

export function PersonaSwitcher({ current, customName }: { current: PersonaId; customName?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const row = (active: boolean) => cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition", active ? "border-teal-600/30 bg-teal-50" : "border-transparent hover:bg-slate-100");
  const badge = (active: boolean) => cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", active ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600");
  return (
    <div role="radiogroup" aria-label="Demo persona" className={cn("space-y-1.5", pending && "opacity-60")}>
      {PERSONA_IDS.map((id) => {
        const p = PERSONAS[id];
        const active = id === current;
        return (
          <button key={id} role="radio" aria-checked={active} onClick={() => start(async () => { await setPersona(id); router.refresh(); })} className={row(active)}>
            <span className={badge(active)}>{p.name.split(" ").map((w) => w[0]).join("")}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">{p.name}</span><span className="block truncate text-xs text-slate-500">{p.role}</span></span>
          </button>
        );
      })}
      {customName ? (
        <button role="radio" aria-checked={current === "custom"} onClick={() => start(async () => { await setPersona("custom"); router.refresh(); })} className={row(current === "custom")}>
          <span className={badge(current === "custom")}><Calculator className="h-4 w-4" aria-hidden="true" /></span>
          <span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">{customName}</span><span className="block truncate text-xs text-slate-500">My own numbers</span></span>
        </button>
      ) : (
        <Link href="/my-numbers" className={cn(row(false), "border-dashed border-slate-300")}>
          <span className={badge(false)}><Calculator className="h-4 w-4" aria-hidden="true" /></span>
          <span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-900">Use my numbers</span><span className="block truncate text-xs text-slate-500">Build your own twin</span></span>
        </Link>
      )}
    </div>
  );
}
