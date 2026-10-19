"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import type { PersonaId } from "@/types/twin";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; text: string; basis?: string[]; followUps?: string[]; mode?: "ai" | "engine" }

export function CopilotChat({ persona, suggestions, initialQuestion }: { persona: PersonaId; suggestions: string[]; initialQuestion?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function ask(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/copilot", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: q, persona }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMsgs((m) => [...m, { role: "assistant", text: data.answer, basis: data.basis, followUps: data.followUps, mode: data.mode }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", text: e instanceof Error ? e.message : "Something went wrong." }]);
    } finally {
      setBusy(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
    }
  }

  const started = useRef(false);
  useEffect(() => {
    if (initialQuestion && !started.current) { started.current = true; void ask(initialQuestion); }
  });

  return (
    <div className="flex h-[620px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_24px_-12px_rgba(15,23,42,0.1)]">
      <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
        {msgs.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><Sparkles className="h-6 w-6" aria-hidden="true" /></span>
            <p className="text-base font-semibold text-slate-900">Ask your twin anything</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Answers are grounded in your forecast, goals and portfolio, and show what they are based on.</p>
            <div className="mt-5 flex max-w-lg flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => ask(s)} className="rounded-full border border-slate-200 px-3.5 py-1.5 text-sm text-slate-700 transition hover:border-teal-600/40 hover:bg-teal-50">{s}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed", m.role === "user" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-800 ring-1 ring-slate-200/70")}>
              <p>{m.text}</p>
              {m.role === "assistant" && m.basis && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", m.mode === "ai" ? "bg-violet-50 text-violet-700" : "bg-teal-50 text-teal-700")}>{m.mode === "ai" ? "AI-written" : "Explainable engine"}</span>
                  {m.basis.slice(0, 3).map((b) => <span key={b} className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">{b}</span>)}
                </div>
              )}
              {m.role === "assistant" && m.followUps && i === msgs.length - 1 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.followUps.map((f) => <button key={f} onClick={() => ask(f)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-teal-600/40">{f}</button>)}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="flex gap-1 pl-2" aria-label="Thinking">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: `${i * 120}ms` }} />)}</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex items-center gap-2 border-t border-slate-100 p-3">
        <label htmlFor="copilot-input" className="sr-only">Ask a question</label>
        <input id="copilot-input" value={input} onChange={(e) => setInput(e.target.value)} maxLength={400} placeholder="Can I afford a ₹50,000 laptop?" className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" />
        <button type="submit" disabled={busy || !input.trim()} className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-40" aria-label="Send">
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
