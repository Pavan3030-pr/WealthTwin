"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPersona } from "@/lib/persona-actions";
import { PERSONAS, PERSONA_IDS } from "@/services/personas";
import type { PersonaId } from "@/types/twin";
import { cn } from "@/lib/utils";

export function PersonaSwitcher({ current }: { current: PersonaId }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div role="radiogroup" aria-label="Demo persona" className={cn("space-y-1.5", pending && "opacity-60")}>
      {PERSONA_IDS.map((id) => {
        const p = PERSONAS[id];
        const active = id === current;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={active}
            onClick={() => start(async () => { await setPersona(id); router.refresh(); })}
            className={cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition", active ? "border-teal-600/30 bg-teal-50" : "border-transparent hover:bg-slate-100")}
          >
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", active ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600")}>
              {p.name.split(" ").map((w) => w[0]).join("")}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-slate-900">{p.name}</span>
              <span className="block truncate text-xs text-slate-500">{p.role}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
