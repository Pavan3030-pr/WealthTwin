import { describe, expect, it } from "vitest";
import { EXAMPLE_INPUT, defaultGoalDate, parseCustomCookie, personaFromInput, resolvePersona, validateCustom } from "@/services/custom";
import { buildTwin } from "@/services/engine";
import { A } from "@/services/assumptions";

const NOW = new Date("2026-10-19T00:00:00");
const good = { ...EXAMPLE_INPUT, goalDate: defaultGoalDate(NOW) };

describe("custom numbers: validation", () => {
  it("accepts the example input", () => {
    expect(validateCustom(good, NOW).ok).toBe(true);
  });
  it("accepts numeric strings from a form", () => {
    const strs = Object.fromEntries(Object.entries(good).map(([k, v]) => [k, String(v)]));
    expect(validateCustom(strs, NOW).ok).toBe(true);
  });
  it("rejects non-numbers, negatives and absurd values", () => {
    for (const bad of [{ monthlyIncome: "abc" }, { housing: -1 }, { cash: 1e12 }, { age: 5 }, { incomeDay: 31 }]) {
      const r = validateCustom({ ...good, ...bad }, NOW);
      expect(r.ok).toBe(false);
    }
  });
  it("rejects a plan with no spending", () => {
    const zero = { ...good, housing: 0, emi: 0, utilities: 0, insurance: 0, subscriptions: 0, education: 0, flexibleSpend: 0 };
    const r = validateCustom(zero, NOW);
    expect(r.ok).toBe(false);
  });
  it("rejects goal dates in the past or too far away, and goals already met", () => {
    expect(validateCustom({ ...good, goalDate: "2026-11" }, NOW).ok).toBe(false);
    expect(validateCustom({ ...good, goalDate: "2090-01" }, NOW).ok).toBe(false);
    expect(validateCustom({ ...good, goalCurrent: good.goalTarget }, NOW).ok).toBe(false);
  });
  it("strips markup from text fields", () => {
    const r = validateCustom({ ...good, name: "<script>alert(1)</script>Ravi" }, NOW);
    expect(r.ok && !/[<>()]/.test(r.value.name)).toBe(true);
  });
  it("handles junk input without throwing", () => {
    for (const j of [null, undefined, 42, "x", [], {}]) expect(() => validateCustom(j, NOW)).not.toThrow();
  });
});

describe("custom numbers: engine", () => {
  const persona = personaFromInput(validateCustom(good, NOW).ok ? (validateCustom(good, NOW) as { ok: true; value: typeof good }).value : good, NOW);
  it("builds a complete, finite twin", () => {
    const t = buildTwin(persona, {}, "2026-10-19");
    expect(t.forecast).toHaveLength(A.FORECAST_DAYS);
    expect(t.goals).toHaveLength(3);
    for (const n of [t.score, t.netWorth, t.monthlySurplus, t.emergencyMonths, t.safetyFloor]) expect(Number.isFinite(n)).toBe(true);
    expect(t.score).toBeGreaterThanOrEqual(0);
    expect(t.score).toBeLessThanOrEqual(100);
  });
  it("uses the documented safety-floor assumption", () => {
    const t = buildTwin(persona, {}, "2026-10-19");
    expect(t.safetyFloor).toBe(Math.round((t.monthlyExpense / 30) * A.SAFETY_FLOOR_DAYS));
  });
  it("survives a user with no investments at all", () => {
    const v = { ...good, liquid: 0, debt: 0, equity: 0, gold: 0 };
    const t = buildTwin(personaFromInput(v, NOW), {}, "2026-10-19");
    expect(Number.isFinite(t.score)).toBe(true);
    expect(t.holdings.length).toBeGreaterThan(0);
    expect(Number.isNaN(t.equityShare)).toBe(false);
  });
  it("reacts to the simulator like a demo persona", () => {
    const a = buildTwin(persona, {}, "2026-10-19"), b = buildTwin(persona, { oneTimeShock: 150000 }, "2026-10-19");
    expect(b.stress.minBalance).toBeLessThan(a.stress.minBalance);
  });
});

describe("custom numbers: cookie handling", () => {
  it("round-trips a valid cookie", () => {
    expect(parseCustomCookie(JSON.stringify(good), NOW)?.persona.id).toBe("custom");
  });
  it("rejects tampered, oversized or malformed cookies", () => {
    expect(parseCustomCookie("{not json", NOW)).toBeNull();
    expect(parseCustomCookie(JSON.stringify({ ...good, monthlyIncome: -5 }), NOW)).toBeNull();
    expect(parseCustomCookie("x".repeat(5000), NOW)).toBeNull();
    expect(parseCustomCookie(undefined, NOW)).toBeNull();
  });
  it("resolves personas safely", () => {
    expect(resolvePersona("aarav")?.id).toBe("aarav");
    expect(resolvePersona("custom")).toBeNull();
    expect(resolvePersona("hacker")).toBeNull();
  });
});
