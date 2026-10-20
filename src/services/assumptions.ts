/** Single source of truth for every modelling assumption. The engine imports these; the Assumptions page displays them. */
export const A = {
  FORECAST_DAYS: 90,
  SAFETY_FLOOR_DAYS: 10,
  DAILY_NOISE: 0.3,
  WEEKEND_FACTOR: 1.3,
  PESSIMISTIC_VARIABLE: 1.2,
  OPTIMISTIC_VARIABLE: 0.92,
  PESSIMISTIC_INCOME_BASE: 0.05,
  OPTIMISTIC_INCOME: 1.04,
  MC_PATHS: 300,
  DIVERSIFICATION: 0.85,
  EMERGENCY_RETURN: 0.065,
  EMERGENCY_VOL: 0.005,
  DOWNSIDE_K: 0.8,
  EQUITY_RULE: 110,
  EQUITY_MIN: 0.3,
  EQUITY_MAX: 0.75,
  VOL_LOW: 0.08,
  VOL_MED: 0.13,
  REBALANCE_BAND: 0.06,
} as const;

export const SCORE = {
  rate: { target: 0.3, max: 25 },
  runway: { months: 6, max: 25 },
  stability: { max: 20, mid: 11, low: 3 },
  debt: { full: 0.15, zero: 0.5, max: 15 },
  mix: { driftZero: 0.35, max: 15, concentration: 0.45, penalty: 3 },
} as const;

export const CLASS_DEFAULTS = {
  equity: { expectedReturn: 0.115, volatility: 0.16 },
  debt: { expectedReturn: 0.075, volatility: 0.02 },
  gold: { expectedReturn: 0.08, volatility: 0.14 },
  cash: { expectedReturn: 0.065, volatility: 0.005 },
} as const;

export const RETIREMENT = { age: 60, multiple: 25 } as const;
