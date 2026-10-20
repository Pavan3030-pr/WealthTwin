"use client";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 print:hidden">
      <Printer className="h-4 w-4" aria-hidden="true" />Print or save as PDF
    </button>
  );
}
