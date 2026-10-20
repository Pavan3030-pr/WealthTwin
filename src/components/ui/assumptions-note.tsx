import Link from "next/link";
import { Info } from "lucide-react";

export function AssumptionsNote({ children }: { children: React.ReactNode }) {
  return (
    <details className="group mt-5 rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-sm text-slate-600">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-slate-800">
        <Info className="h-4 w-4 text-teal-700" aria-hidden="true" />How is this calculated?
        <span className="ml-auto text-xs font-normal text-slate-400 group-open:hidden">Show</span>
      </summary>
      <div className="mt-3 space-y-2 leading-relaxed">{children}<p><Link href="/assumptions" className="font-medium text-teal-700 hover:underline">See every assumption</Link>. Illustrative model, not investment advice.</p></div>
    </details>
  );
}
