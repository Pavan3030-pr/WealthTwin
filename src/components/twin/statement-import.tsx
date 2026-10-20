"use client";
import { useRef, useState } from "react";
import { Download, FileUp, ShieldCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/surface";
import { MAX_BYTES, parseStatement, sampleStatement, type StatementSummary } from "@/services/statement";
import { cn, inr } from "@/lib/utils";

export function StatementImport({ onApply }: { onApply: (fields: StatementSummary["fields"]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<StatementSummary | null>(null);
  const [name, setName] = useState("");
  const [applied, setApplied] = useState(false);

  async function handle(file: File | undefined) {
    setError(null); setSummary(null); setApplied(false);
    if (!file) return;
    if (file.size > MAX_BYTES) { setError("File is larger than 2 MB. Export a shorter date range."); return; }
    if (!/\.(csv|txt)$/i.test(file.name) && !file.type.includes("csv") && !file.type.includes("text")) { setError("Please choose a .csv file."); return; }
    setName(file.name);
    const r = parseStatement(await file.text());
    if (!r.ok) setError(r.error); else setSummary(r.summary);
  }

  function downloadSample() {
    const url = URL.createObjectURL(new Blob([sampleStatement()], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "sample-bank-statement.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardTitle hint="Skip the typing: upload a bank statement CSV and we will estimate the fields below." right={
        <button type="button" onClick={downloadSample} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"><Download className="h-3.5 w-3.5" aria-hidden="true" />Sample CSV</button>
      }>Import a bank statement</CardTitle>

      <label htmlFor="statement-file" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void handle(e.dataTransfer.files[0]); }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center transition hover:border-teal-500/50 hover:bg-teal-50/40">
        <FileUp className="h-7 w-7 text-teal-700" aria-hidden="true" />
        <span className="mt-2 text-sm font-medium text-slate-800">{name || "Drop a .csv here or click to choose"}</span>
        <span className="mt-0.5 text-xs text-slate-500">Works with most Indian bank exports (debit/credit columns, or signed / Dr-Cr amounts)</span>
        <input ref={input} id="statement-file" type="file" accept=".csv,.txt,text/csv,text/plain" className="sr-only" onChange={(e) => void handle(e.target.files?.[0])} />
      </label>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />Read in your browser. The file is never uploaded; only the totals you accept are kept.</p>

      {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">{error}</p>}

      {summary && (
        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200" aria-live="polite">
          <p className="text-sm font-semibold text-slate-900">Found {summary.rows.toLocaleString("en-IN")} transactions across {summary.months} month{summary.months > 1 ? "s" : ""}</p>
          <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {summary.lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-3"><span className={cn(l.kind === "info" ? "text-slate-400" : "text-slate-600")}>{l.label}</span><span className="num font-medium text-slate-900">{inr(l.monthly)}<span className="font-normal text-slate-400"> /mo</span></span></li>
            ))}
          </ul>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">{summary.notes.map((n) => <li key={n}>• {n}</li>)}</ul>
          <button type="button" onClick={() => { onApply(summary.fields); setApplied(true); }} className="mt-4 inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800">{applied ? "Applied. Review below" : "Use these numbers"}</button>
        </div>
      )}
    </Card>
  );
}
