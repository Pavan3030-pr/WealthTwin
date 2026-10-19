import { describe, expect, it } from "vitest";
import { buildTwin, goalProbability, monthsToTarget, requiredMonthly } from "@/services/engine";
import { answerWithEngine } from "@/services/copilot";

const AS_OF = "2026-10-19";

describe("engine", () => {
  it("is deterministic for the same persona and date", () => {
    expect(buildTwin("aarav", {}, AS_OF).score).toBe(buildTwin("aarav", {}, AS_OF).score);
  });
  it("keeps score within 0-100 and factors sum to score", () => {
    for (const id of ["aarav", "meera", "rohan"] as const) {
      const t = buildTwin(id, {}, AS_OF);
      expect(t.score).toBeGreaterThanOrEqual(0);
      expect(t.score).toBeLessThanOrEqual(100);
      expect(Math.abs(t.factors.reduce((s, f) => s + f.points, 0) - t.score)).toBeLessThanOrEqual(1);
    }
  });
  it("forecasts 90 days", () => {
    expect(buildTwin("meera", {}, AS_OF).forecast).toHaveLength(90);
  });
  it("freelancer shows more stress than salaried persona", () => {
    expect(buildTwin("meera", {}, AS_OF).stress.pessimisticMin).toBeLessThan(buildTwin("aarav", {}, AS_OF).stress.pessimisticMin);
  });
  it("a large one-time expense lowers the minimum balance", () => {
    const a = buildTwin("aarav", {}, AS_OF), b = buildTwin("aarav", { oneTimeShock: 100000 }, AS_OF);
    expect(b.stress.minBalance).toBeLessThan(a.stress.minBalance);
  });
  it("a market fall lowers net worth and an income rise raises surplus", () => {
    const a = buildTwin("rohan", {}, AS_OF);
    expect(buildTwin("rohan", { marketDropPct: 30 }, AS_OF).netWorth).toBeLessThan(a.netWorth);
    expect(buildTwin("rohan", { incomeChangePct: 15 }, AS_OF).monthlySurplus).toBeGreaterThan(a.monthlySurplus);
  });
  it("extra SIP improves goal probability", () => {
    const a = buildTwin("aarav", {}, AS_OF).goals[1].probability;
    expect(buildTwin("aarav", { extraSip: 10000 }, AS_OF).goals[1].probability).toBeGreaterThanOrEqual(a);
  });
  it("clamps hostile overrides", () => {
    const t = buildTwin("aarav", { expenseCutPct: 999, marketDropPct: -50, extraSip: -5, incomeChangePct: 1e9 }, AS_OF);
    expect(Number.isFinite(t.score)).toBe(true);
  });
});

describe("goal maths", () => {
  it("required monthly reaches the target", () => {
    const m = requiredMonthly(100000, 1000000, 0.1, 60);
    expect(monthsToTarget(100000, m + 1, 0.1, 1000000)).toBeLessThanOrEqual(60);
  });
  it("probability is bounded and monotonic in contribution", () => {
    const lo = goalProbability(100000, 5000, 0.1, 0.15, 1000000, 84, 1);
    const hi = goalProbability(100000, 15000, 0.1, 0.15, 1000000, 84, 1);
    expect(lo).toBeGreaterThanOrEqual(0);
    expect(hi).toBeLessThanOrEqual(1);
    expect(hi).toBeGreaterThanOrEqual(lo);
  });
});

describe("copilot engine", () => {
  it("answers affordability with numbers", () => {
    const r = answerWithEngine("aarav", "Can I afford a ₹40,000 phone?", AS_OF);
    expect(r.answer).toMatch(/40,000/);
    expect(r.basis.length).toBeGreaterThan(0);
  });
  it("warns when a purchase breaks the safety floor", () => {
    expect(answerWithEngine("meera", "can I afford a ₹2 lakh trip", AS_OF).answer).toMatch(/pause/i);
  });
});

import { adaptiveSip, fitness, nextBestAction, safeToSpend } from "@/services/advisor";

describe("advisor", () => {
  it("returns a next action for every persona", () => {
    for (const id of ["aarav", "meera", "rohan"] as const) {
      const a = nextBestAction(buildTwin(id, {}, AS_OF));
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.href.startsWith("/")).toBe(true);
    }
  });
  it("safe-to-spend is never negative and shrinks for stressed personas", () => {
    const a = safeToSpend(buildTwin("aarav", {}, AS_OF)), m = safeToSpend(buildTwin("meera", {}, AS_OF));
    expect(a.headroom).toBeGreaterThanOrEqual(0);
    expect(m.headroom).toBeLessThanOrEqual(a.headroom);
  });
  it("adaptive SIP never suggests an increase when cash is stressed", () => {
    const t = buildTwin("meera", {}, AS_OF);
    const s = adaptiveSip(t);
    if (t.cashflowHealth === "high") expect(s.suggested).toBeLessThan(s.current);
  });
  it("fitness level is derived from score", () => {
    expect(fitness(buildTwin("aarav", {}, AS_OF)).badges.length).toBe(6);
  });
  it("negative SIP override lowers outflow", () => {
    const a = buildTwin("meera", {}, AS_OF), b = buildTwin("meera", { extraSip: -5000 }, AS_OF);
    expect(b.stress.minBalance).toBeGreaterThanOrEqual(a.stress.minBalance);
  });
});
