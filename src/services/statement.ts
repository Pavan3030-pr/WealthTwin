/** Bank statement CSV -> suggested "My numbers" fields. Pure and browser-safe: the file never leaves the device. */
import type { CustomInput } from "./custom";

export interface StatementSummary {
  months: number;
  rows: number;
  skipped: number;
  fields: Partial<Record<keyof CustomInput, number | string>>;
  lines: { label: string; monthly: number; kind: "income" | "spend" | "info" }[];
  notes: string[];
}
export type StatementResult = { ok: true; summary: StatementSummary } | { ok: false; error: string };

export const MAX_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 20000;
const MONTHS: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const pad = (n: number) => String(n).padStart(2, "0");

function splitCsv(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); cur = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
      if (rows.length > MAX_ROWS + 60) break;
    } else cur += c;
  }
  row.push(cur);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

function detectDelimiter(text: string): string {
  const head = text.split(/\r?\n/).slice(0, 15).join("\n");
  const counts = [",", ";", "\t", "|"].map((d) => [d, head.split(d).length - 1] as const);
  return counts.sort((a, b) => b[1] - a[1])[0][0];
}

export function parseDate(s: string): Date | null {
  const t = s.trim();
  let y: number, m: number, d: number, x: RegExpMatchArray | null;
  if ((x = t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/))) { y = +x[1]; m = +x[2] - 1; d = +x[3]; }
  else if ((x = t.match(/^(\d{1,2})[-/ .](\d{1,2})[-/ .](\d{2,4})/))) { d = +x[1]; m = +x[2] - 1; y = +x[3]; if (y < 100) y += 2000; }
  else if ((x = t.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[A-Za-z]*[-/ ,.]*(\d{2,4})/))) { d = +x[1]; m = MONTHS[x[2].toLowerCase()] ?? -1; y = +x[3]; if (y < 100) y += 2000; }
  else return null;
  if (m < 0 || m > 11 || d < 1 || d > 31 || y < 2000 || y > 2100) return null;
  const dt = new Date(y, m, d);
  return dt.getMonth() === m ? dt : null;
}

function parseNum(s: string | undefined): { n: number; dir?: "dr" | "cr" } | null {
  if (s === undefined) return null;
  let t = s.trim();
  if (!t) return null;
  let neg = false, dir: "dr" | "cr" | undefined;
  if (/^\(.*\)$/.test(t)) { neg = true; t = t.slice(1, -1); }
  const suf = t.match(/\s*(dr|cr)\.?$/i);
  if (suf) { dir = suf[1].toLowerCase() as "dr" | "cr"; t = t.slice(0, suf.index); }
  t = t.replace(/(₹|rs\.?|inr)/gi, "").replace(/[,\s]/g, "");
  if (t.startsWith("-")) { neg = true; t = t.slice(1); }
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  return { n: neg ? -parseFloat(t) : parseFloat(t), dir };
}

const CATS: { key: keyof CustomInput | "investing"; label: string; re: RegExp }[] = [
  { key: "investing", label: "Investments (SIPs)", re: /\b(sip|mutual fund|mf\b|groww|zerodha|kuvera|coin\b|smallcase|indmoney|nps|ppf|etf|bse star|iccl|nse clearing)/i },
  { key: "emi", label: "Loan EMIs", re: /\b(emi|loan|bajaj ?fin|nach.*(loan|fin))|home loan|car loan/i },
  { key: "housing", label: "Rent or housing", re: /\b(rent|landlord|housing|society|maintenance|nobroker|nestaway)\b/i },
  { key: "utilities", label: "Utilities and internet", re: /(electric|bescom|tsspdcl|tneb|msedcl|bses|water bill|gas|broadband|fibernet|airtel|jio\b|\bvi\b|bsnl|dth|tata ?(play|sky)|recharge)/i },
  { key: "insurance", label: "Insurance", re: /(insurance|\blic\b|policybazaar|premium|star health|ergo|acko|digit\b)/i },
  { key: "subscriptions", label: "Subscriptions", re: /(netflix|spotify|prime|hotstar|disney|youtube|apple\.com|itunes|icloud|google ?(play|one)|adobe|notion|openai|chatgpt|canva|linkedin|zee5|sonyliv)/i },
  { key: "education", label: "School or course fees", re: /(school|college|tuition|byju|unacademy|coursera|udemy|upgrad|exam fee)/i },
];
const SKIP_CREDIT = /(refund|reversal|cashback|interest|dividend|self transfer|own account|failed|returned)/i;
const SKIP_BOTH = /(self transfer|own account|transfer to self|sweep)/i;

const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };

export function parseStatement(text: string): StatementResult {
  if (!text || text.trim().length < 20) return { ok: false, error: "That file looks empty." };
  if (text.length > MAX_BYTES) return { ok: false, error: "File is larger than 2 MB. Export a shorter date range." };
  const rows = splitCsv(text.replace(/^\uFEFF/, ""), detectDelimiter(text));

  let h = -1;
  for (let i = 0; i < Math.min(rows.length, 40); i++) {
    const cells = rows[i].map((c) => c.trim().toLowerCase());
    if (cells.some((c) => /date/.test(c)) && cells.some((c) => /(debit|credit|withdraw|deposit|amount|dr\b|cr\b)/.test(c))) { h = i; break; }
  }
  if (h < 0) return { ok: false, error: "Could not find Date and Amount columns. Export your statement as CSV with a header row." };
  const head = rows[h].map((c) => c.trim().toLowerCase());
  const idx = (re: RegExp, not?: RegExp) => head.findIndex((c) => re.test(c) && !(not && not.test(c)));
  const iDate = idx(/date/, /value/) >= 0 ? idx(/date/, /value/) : idx(/date/);
  const iDesc = idx(/(narration|description|particulars|details|remarks)/);
  const iDeb = idx(/(debit|withdraw|paid out|\bdr\b)/);
  const iCre = idx(/(credit|deposit|paid in|\bcr\b)/);
  const iAmt = idx(/^amount|amount \(/);
  const iType = idx(/^(type|dr\/cr|cr\/dr|txn type)/);
  const iBal = idx(/balance/);
  if (iDate < 0 || (iDeb < 0 && iCre < 0 && iAmt < 0)) return { ok: false, error: "Could not find Date and Amount columns." };

  type Tx = { d: Date; out: number; inn: number; desc: string; bal?: number };
  const txs: Tx[] = [];
  let skipped = 0, sawNegative = false, sawDir = false;
  for (const r of rows.slice(h + 1, h + 1 + MAX_ROWS)) {
    const d = parseDate(r[iDate] ?? "");
    if (!d) { skipped++; continue; }
    let out = 0, inn = 0;
    if (iDeb >= 0 || iCre >= 0) {
      out = Math.abs(parseNum(r[iDeb])?.n ?? 0);
      inn = Math.abs(parseNum(r[iCre])?.n ?? 0);
    } else {
      const a = parseNum(r[iAmt]);
      if (!a || a.n === 0) { skipped++; continue; }
      const t = iType >= 0 ? (r[iType] ?? "").trim().toLowerCase() : "";
      const dir = a.dir ?? (/^(dr|debit|d)\b/.test(t) ? "dr" : /^(cr|credit|c)\b/.test(t) ? "cr" : undefined);
      if (dir) sawDir = true;
      if (a.n < 0) sawNegative = true;
      if (dir === "dr" || (!dir && a.n < 0)) out = Math.abs(a.n); else if (dir === "cr" || (!dir && a.n > 0)) inn = Math.abs(a.n);
    }
    if (out === 0 && inn === 0) { skipped++; continue; }
    txs.push({ d, out, inn, desc: iDesc >= 0 ? (r[iDesc] ?? "") : "", bal: iBal >= 0 ? parseNum(r[iBal])?.n : undefined });
  }
  if (iDeb < 0 && iCre < 0 && !sawNegative && !sawDir) return { ok: false, error: "Amounts need a Dr/Cr marker, signed values, or separate debit and credit columns." };
  if (txs.length < 5) return { ok: false, error: "Found fewer than 5 usable transactions. Check the file is a bank statement CSV." };

  const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  let keys = [...new Set(txs.map((t) => monthKey(t.d)))].sort();
  const notes: string[] = [];
  if (keys.length >= 4) { notes.push("Dropped the first and last month because they are usually partial."); keys = keys.slice(1, -1); }
  const use = new Set(keys);
  const months = keys.length;
  const inRange = txs.filter((t) => use.has(monthKey(t.d)));

  const totals: Record<string, number> = { housing: 0, emi: 0, utilities: 0, insurance: 0, subscriptions: 0, education: 0, flexibleSpend: 0, investing: 0 };
  const incomeByMonth: Record<string, number> = {};
  const topCredit: Record<string, { amt: number; day: number }> = {};
  for (const t of inRange) {
    if (SKIP_BOTH.test(t.desc)) continue;
    if (t.out > 0) {
      const c = CATS.find((x) => x.re.test(t.desc));
      totals[c ? c.key : "flexibleSpend"] += t.out;
    }
    if (t.inn > 0 && !SKIP_CREDIT.test(t.desc)) {
      const k = monthKey(t.d);
      incomeByMonth[k] = (incomeByMonth[k] ?? 0) + t.inn;
      if (!topCredit[k] || t.inn > topCredit[k].amt) topCredit[k] = { amt: t.inn, day: t.d.getDate() };
    }
  }
  const per = (n: number) => Math.round(n / months);
  const incomes = keys.map((k) => incomeByMonth[k] ?? 0);
  const monthlyIncome = per(incomes.reduce((a, b) => a + b, 0));

  const fields: StatementSummary["fields"] = {
    housing: per(totals.housing), emi: per(totals.emi), utilities: per(totals.utilities), insurance: per(totals.insurance),
    subscriptions: per(totals.subscriptions), education: per(totals.education), flexibleSpend: per(totals.flexibleSpend),
  };
  if (monthlyIncome >= 5000) {
    fields.monthlyIncome = monthlyIncome;
    fields.incomeDay = Math.min(28, Math.max(1, median(keys.map((k) => topCredit[k]?.day ?? 1))));
    if (months >= 3) {
      const mean = monthlyIncome, sd = Math.sqrt(incomes.reduce((s, x) => s + (x - mean) ** 2, 0) / months);
      const cv = Math.min(60, Math.round((sd / mean) * 100));
      fields.incomeVariation = cv;
      fields.incomeType = cv >= 15 ? "freelance" : "salaried";
    } else notes.push("Need 3+ months to measure how much your income varies; left unchanged.");
  } else notes.push("Could not find income credits of at least ₹5,000 a month; enter income yourself.");

  const withBal = inRange.concat(txs).filter((t) => t.bal !== undefined).sort((a, b) => a.d.getTime() - b.d.getTime());
  const last = withBal.length ? withBal[withBal.length - 1].bal : undefined;
  if (last !== undefined && last >= 0) fields.cash = Math.round(last);
  if (skipped > 0) notes.push(`Skipped ${skipped} row${skipped > 1 ? "s" : ""} without a readable date or amount.`);
  notes.push("Categories come from keywords in the narration. Review each value before building your twin.");

  const lines: StatementSummary["lines"] = [{ label: "Income", monthly: monthlyIncome, kind: "income" }];
  for (const c of CATS) if (c.key !== "investing") lines.push({ label: c.label, monthly: per(totals[c.key]), kind: "spend" });
  lines.push({ label: "Everything else (flexible)", monthly: per(totals.flexibleSpend), kind: "spend" });
  lines.push({ label: "Investments seen (not counted as spending)", monthly: per(totals.investing), kind: "info" });
  return { ok: true, summary: { months, rows: inRange.length, skipped, fields, lines: lines.filter((l) => l.monthly > 0 || l.kind === "income"), notes } };
}

export function sampleStatement(now = new Date()): string {
  const out = ["Date,Narration,Withdrawal Amt.,Deposit Amt.,Closing Balance"];
  let bal = 140000, seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const fmt = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  for (let m = 3; m >= 1; m--) {
    const y = now.getFullYear(), mo = now.getMonth() - m;
    const day = (n: number) => new Date(y, mo, n);
    const add = (n: number, desc: string, w: number, dep: number) => { bal += dep - w; out.push(`${fmt(day(n))},${desc},${w ? w.toFixed(2) : ""},${dep ? dep.toFixed(2) : ""},${bal.toFixed(2)}`); };
    add(1, "NEFT-ACME TECHNOLOGIES PAYROLL", 0, 120000);
    add(2, "NACH-GROWW MUTUAL FUND SIP", 12000, 0);
    add(5, "UPI-RENT LANDLORD", 26000, 0);
    add(6, "ECS-HDFC HOME LOAN EMI", 8000, 0);
    add(9, "BESCOM ELECTRICITY BILL", 2300 + Math.round(rnd() * 600), 0);
    add(10, "ACT FIBERNET BROADBAND", 1200, 0);
    add(12, "NETFLIX SUBSCRIPTION", 649, 0);
    add(12, "SPOTIFY INDIA", 119, 0);
    add(15, "LIC PREMIUM", 2000, 0);
    for (const [n, d] of [[3, "UPI-BIGBASKET GROCERIES"], [8, "UPI-SWIGGY"], [11, "UPI-UBER TRIP"], [14, "UPI-AMAZON PAY"], [18, "UPI-ZOMATO"], [21, "UPI-BIGBASKET GROCERIES"], [24, "UPI-MYNTRA"], [27, "UPI-DMART"]] as [number, string][]) add(n, d, 1200 + Math.round(rnd() * 3200), 0);
    add(28, "INT.PD CREDIT INTEREST", 0, 312);
  }
  return out.join("\n");
}
