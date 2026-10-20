"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, Wand2 } from "lucide-react";
import { clearCustom, saveCustom } from "@/lib/persona-actions";
import { EXAMPLE_INPUT, defaultGoalDate, type CustomInput } from "@/services/custom";
import { StatementImport } from "./statement-import";
import { Card, CardTitle } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

type K = keyof CustomInput;
type Kind = "money" | "number" | "percent" | "text" | "month" | "select";
interface Field { key: K; label: string; kind: Kind; hint?: string }

const SECTIONS: { title: string; hint: string; fields: Field[] }[] = [
  { title: "About you", hint: "Used to suggest an age-appropriate equity share.", fields: [
    { key: "name", label: "First name", kind: "text" }, { key: "age", label: "Age", kind: "number" }, { key: "incomeType", label: "Income type", kind: "select" } ] },
  { title: "Income", hint: "Average take-home per month.", fields: [
    { key: "monthlyIncome", label: "Monthly take-home", kind: "money" },
    { key: "incomeVariation", label: "Typical monthly swing", kind: "percent", hint: "0 for a fixed salary; 30+ for irregular invoices" },
    { key: "incomeDay", label: "Usual pay day (1 to 28)", kind: "number" } ] },
  { title: "Fixed monthly bills", hint: "Leave zero if not applicable.", fields: [
    { key: "housing", label: "Rent or housing", kind: "money" }, { key: "emi", label: "Loan EMIs", kind: "money" }, { key: "utilities", label: "Utilities and internet", kind: "money" },
    { key: "insurance", label: "Insurance premiums", kind: "money" }, { key: "subscriptions", label: "Subscriptions", kind: "money" }, { key: "education", label: "School or course fees", kind: "money" } ] },
  { title: "Flexible spending", hint: "Food, transport, shopping, fun: everything that varies.", fields: [{ key: "flexibleSpend", label: "Per month", kind: "money" }] },
  { title: "What you have today", hint: "Approximate balances are fine.", fields: [
    { key: "cash", label: "Bank balance", kind: "money" }, { key: "liquid", label: "Liquid funds", kind: "money" }, { key: "debt", label: "Debt, PPF, EPF, NPS", kind: "money" },
    { key: "equity", label: "Equity funds and stocks", kind: "money" }, { key: "gold", label: "Gold", kind: "money" } ] },
  { title: "Goals", hint: "Emergency fund target is set to 6 months of your spending.", fields: [
    { key: "emergencyMonthly", label: "Monthly to emergency fund", kind: "money" },
    { key: "goalName", label: "Your main goal", kind: "text" }, { key: "goalTarget", label: "Goal target", kind: "money" }, { key: "goalCurrent", label: "Saved so far", kind: "money" },
    { key: "goalMonthly", label: "Monthly towards goal", kind: "money" }, { key: "goalDate", label: "Target month", kind: "month" },
    { key: "retireCurrent", label: "Retirement corpus today", kind: "money" }, { key: "retireMonthly", label: "Monthly towards retirement", kind: "money" } ] },
];

const BLANK: Record<K, string> = {
  name: "", age: "", incomeType: "salaried", monthlyIncome: "", incomeVariation: "0", incomeDay: "1", housing: "0", emi: "0", utilities: "0", insurance: "0", subscriptions: "0", education: "0",
  flexibleSpend: "", cash: "0", liquid: "0", debt: "0", equity: "0", gold: "0", emergencyMonthly: "0", goalName: "", goalTarget: "", goalCurrent: "0", goalMonthly: "0", goalDate: "", retireCurrent: "0", retireMonthly: "0",
};

const toStrings = (v: CustomInput): Record<K, string> => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, String(x)])) as Record<K, string>;

export function CustomForm({ initial }: { initial: CustomInput | null }) {
  const router = useRouter();
  const [vals, setVals] = useState<Record<K, string>>(initial ? toStrings(initial) : { ...BLANK, goalDate: defaultGoalDate() });
  const [errors, setErrors] = useState<Partial<Record<K | "form", string>>>({});
  const [pending, start] = useTransition();

  const set = (k: K, v: string) => { setVals((s) => ({ ...s, [k]: v })); if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined })); };
  const loadExample = () => { setVals({ ...toStrings(EXAMPLE_INPUT), goalDate: defaultGoalDate() }); setErrors({}); };

  const applyStatement = (f: Partial<Record<K, number | string>>) => {
    setVals((v) => ({ ...v, ...Object.fromEntries(Object.entries(f).map(([k, x]) => [k, String(x)])) }));
    setErrors({});
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await saveCustom(vals);
      if (!r.ok) { setErrors(r.errors); document.getElementById("form-errors")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      router.push("/dashboard");
      router.refresh();
    });
  }

  const inputCls = (bad: boolean) => cn("h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2", bad ? "border-rose-400 focus:ring-rose-400/20" : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/15");

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-teal-50 p-4 text-sm text-teal-900 ring-1 ring-teal-600/15">
        <span className="flex items-center gap-2"><Lock className="h-4 w-4 shrink-0" aria-hidden="true" />Stored only in a cookie on this device. Nothing is saved to a database.</span>
        <button type="button" onClick={loadExample} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-medium ring-1 ring-teal-600/20 hover:bg-teal-50"><Wand2 className="h-3.5 w-3.5" aria-hidden="true" />Fill with an example</button>
      </div>

      <StatementImport onApply={applyStatement} />

      {(errors.form || Object.values(errors).some(Boolean)) && (
        <div id="form-errors" role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200">
          <p className="font-semibold">Please fix the highlighted fields</p>
          {errors.form && <p className="mt-1">{errors.form}</p>}
        </div>
      )}

      {SECTIONS.map((sec) => (
        <Card key={sec.title}>
          <CardTitle hint={sec.hint}>{sec.title}</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sec.fields.map((f) => {
              const id = `f-${f.key}`;
              const err = errors[f.key];
              return (
                <div key={f.key}>
                  <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{f.label}</label>
                  <div className="relative">
                    {f.kind === "money" && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₹</span>}
                    {f.kind === "select" ? (
                      <select id={id} value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} className={inputCls(false)}>
                        <option value="salaried">Salaried (fixed pay day)</option><option value="freelance">Freelance (irregular invoices)</option>
                      </select>
                    ) : (
                      <input id={id} value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)}
                        type={f.kind === "text" ? "text" : f.kind === "month" ? "month" : "number"} inputMode={f.kind === "text" || f.kind === "month" ? undefined : "decimal"}
                        min={f.kind === "number" || f.kind === "money" || f.kind === "percent" ? 0 : undefined} step="any" maxLength={f.kind === "text" ? 50 : undefined}
                        aria-invalid={!!err} aria-describedby={err ? `${id}-err` : f.hint ? `${id}-hint` : undefined}
                        className={cn(inputCls(!!err), f.kind === "money" && "pl-7", f.kind === "percent" && "pr-8")} />
                    )}
                    {f.kind === "percent" && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>}
                  </div>
                  {err ? <p id={`${id}-err`} className="mt-1 text-xs text-rose-600">{err}</p> : f.hint ? <p id={`${id}-hint`} className="mt-1 text-xs text-slate-400">{f.hint}</p> : null}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="inline-flex h-12 items-center rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60">{pending ? "Building your twin…" : "Build my twin"}</button>
        {initial && <button type="button" onClick={() => start(async () => { await clearCustom(); router.push("/dashboard"); router.refresh(); })} className="h-12 rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Delete my numbers</button>}
      </div>
    </form>
  );
}
