"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, Sparkles, User } from "lucide-react";
import { NAV } from "./sidebar";
import { setPersona } from "@/lib/persona-actions";
import { PERSONAS, PERSONA_IDS } from "@/services/personas";
import { cn } from "@/lib/utils";

interface Item { id: string; label: string; hint: string; icon: React.ComponentType<{ className?: string }>; run: () => void }

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => { setOpen(false); setQ(""); setIdx(0); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);

  const items = useMemo<Item[]>(() => {
    const nav: Item[] = NAV.map((n) => ({ id: n.href, label: n.label, hint: "Go to page", icon: n.icon, run: () => router.push(n.href) }));
    const people: Item[] = PERSONA_IDS.map((id) => ({
      id: `p-${id}`, label: `Switch to ${PERSONAS[id].name}`, hint: PERSONAS[id].role, icon: User,
      run: async () => { await setPersona(id); router.refresh(); },
    }));
    const all = [...nav, ...people];
    const term = q.trim().toLowerCase();
    const filtered = term ? all.filter((i) => `${i.label} ${i.hint}`.toLowerCase().includes(term)) : all;
    if (term.length > 2) filtered.push({ id: "ask", label: `Ask Copilot: “${q.trim()}”`, hint: "AI answer from your twin", icon: Sparkles, run: () => router.push(`/copilot?q=${encodeURIComponent(q.trim().slice(0, 300))}`) });
    return filtered;
  }, [q, router]);

  function choose(i: Item | undefined) { if (!i) return; close(); i.run(); }

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open command menu" className="group flex h-11 w-full max-w-xl items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-white">
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="flex-1 text-left">Search or ask your twin…</span>
        <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs font-medium text-slate-500">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/30 p-4 pt-[14vh] backdrop-blur-sm" onMouseDown={close} role="presentation">
          <div role="dialog" aria-modal="true" aria-label="Command menu" onMouseDown={(e) => e.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
                  if (e.key === "Enter") choose(items[idx]);
                }}
                placeholder="Jump to a page, switch persona, or ask a question" aria-label="Search commands" className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400" />
            </div>
            <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
              {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-500">No matches</li>}
              {items.map((i, n) => (
                <li key={i.id} role="option" aria-selected={n === idx}>
                  <button onMouseEnter={() => setIdx(n)} onClick={() => choose(i)} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm", n === idx ? "bg-slate-100" : "")}>
                    <i.icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    <span className="flex-1 font-medium text-slate-900">{i.label}</span>
                    <span className="text-xs text-slate-400">{i.hint}</span>
                    {n === idx && <CornerDownLeft className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
