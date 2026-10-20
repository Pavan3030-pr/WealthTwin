import { describe, expect, it } from "vitest";
import { parseDate, parseStatement, sampleStatement } from "@/services/statement";
import { validateCustom, personaFromInput, EXAMPLE_INPUT, defaultGoalDate } from "@/services/custom";
import { buildTwin } from "@/services/engine";

const NOW = new Date("2026-10-19T00:00:00");

describe("statement import", () => {
  it("parses the sample statement into sensible monthly numbers", () => {
    const r = parseStatement(sampleStatement(NOW));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const f = r.summary.fields;
    expect(r.summary.months).toBe(3);
    expect(f.monthlyIncome).toBe(120000);
    expect(f.housing).toBe(26000);
    expect(f.emi).toBe(8000);
    expect(f.insurance).toBe(2000);
    expect(f.subscriptions).toBe(768);
    expect(f.incomeType).toBe("salaried");
    expect(f.incomeDay).toBe(1);
    expect(Number(f.flexibleSpend)).toBeGreaterThan(5000);
    expect(Number(f.cash)).toBeGreaterThan(0);
  });
  it("does not count SIPs as spending or interest as income", () => {
    const r = parseStatement(sampleStatement(NOW));
    if (!r.ok) throw new Error("parse failed");
    expect(r.summary.fields.monthlyIncome).toBe(120000);
    expect(r.summary.lines.find((l) => l.label.startsWith("Investments"))?.monthly).toBe(12000);
  });
  it("feeds straight into a valid custom twin", () => {
    const r = parseStatement(sampleStatement(NOW));
    if (!r.ok) throw new Error("parse failed");
    const merged = { ...EXAMPLE_INPUT, goalDate: defaultGoalDate(NOW), ...r.summary.fields };
    const v = validateCustom(merged, NOW);
    expect(v.ok).toBe(true);
    if (v.ok) expect(Number.isFinite(buildTwin(personaFromInput(v.value, NOW), {}, "2026-10-19").score)).toBe(true);
  });
  it("handles signed single-amount statements, preamble lines and DD-MMM-YYYY dates", () => {
    const csv = [
      "ACME BANK Statement", "Account: XXXX1234", "",
      "Txn Date;Description;Amount;Balance",
      ...["Jun", "Jul", "Aug"].flatMap((m) => [
        `01-${m}-2026;SALARY CREDIT;95000.00;200000`, `05-${m}-2026;RENT PAYMENT;-22000;178000`, `09-${m}-2026;UPI GROCERIES;-3000;175000`,
        `12-${m}-2026;UPI FOOD;-1500;173500`, `20-${m}-2026;UPI SHOPPING;-2500;171000`,
      ]),
    ].join("\n");
    const r = parseStatement(csv);
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.summary.fields.monthlyIncome).toBe(95000); expect(r.summary.fields.housing).toBe(22000); expect(r.summary.fields.flexibleSpend).toBe(7000); }
  });
  it("understands Dr/Cr suffixes with Indian number formatting", () => {
    const csv = ["Date,Particulars,Amount", ...["01/07/2026", "01/08/2026", "01/09/2026"].flatMap((d) => [`${d},SALARY,"1,20,000.00 Cr"`, `${d},RENT,"25,000.00 Dr"`, `${d},UPI FOOD,"4,000.00 Dr"`, `${d},UPI TAXI,"1,000.00 Dr"`])].join("\n");
    const r = parseStatement(csv);
    expect(r.ok && r.summary.fields.monthlyIncome === 120000).toBe(true);
  });
  it("flags irregular income as freelance", () => {
    const rows = [["01/06/2026", 40000], ["01/07/2026", 150000], ["01/08/2026", 70000]].flatMap(([d, a]) => [`${d},CLIENT INVOICE PAYMENT,,${a},1`, `${d},UPI FOOD,2000,,1`, `${d},UPI TAXI,1000,,1`]);
    const r = parseStatement(["Date,Narration,Debit,Credit,Balance", ...rows].join("\n"));
    expect(r.ok && r.summary.fields.incomeType === "freelance").toBe(true);
  });
  it("rejects junk, empty, ambiguous and oversized files without throwing", () => {
    for (const bad of ["", "hello world", "a,b,c\n1,2,3", "Date,Narration,Amount\n01/01/2026,X,100\n02/01/2026,Y,200\n03/01/2026,Z,300\n04/01/2026,Q,1\n05/01/2026,R,2", "x".repeat(3 * 1024 * 1024)]) {
      const r = parseStatement(bad);
      expect(r.ok).toBe(false);
    }
  });
  it("parses common date formats and rejects invalid ones", () => {
    expect(parseDate("19/10/2026")?.getDate()).toBe(19);
    expect(parseDate("2026-10-19")?.getMonth()).toBe(9);
    expect(parseDate("19 Oct 2026")?.getFullYear()).toBe(2026);
    expect(parseDate("31/02/2026")).toBeNull();
    expect(parseDate("not a date")).toBeNull();
  });
});
