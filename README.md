# WealthTwin
  wealth-twin-three.vercel.app

**Your living digital finance twin.** Built for the Mochavate Product Innovation Challenge by Mochatrade.

WealthTwin fuses (synthetic) transactions, bills, portfolio and goals into one explainable model that:

- **Forecasts cashflow stress** 90 days ahead with a likely range and a safety floor
- **Explains financial health** as five weighted, inspectable factors
- **Simulates decisions** (raise, market crash, medical bill, extra SIP) with instant recompute
- **Scores goals probabilistically** using a 300-path Monte Carlo
- **Answers questions** via an AI Copilot grounded in the twin (works offline on the built-in engine; uses Claude when `ANTHROPIC_API_KEY` is set)
- **Teaches in context** with lessons and quizzes that quote the user's own numbers

- **Builds from your own numbers** (`/my-numbers`): validated form, stored only in an httpOnly cookie on your device
- **Shows its work** (`/assumptions`): every modelling assumption lives in `src/services/assumptions.ts`

Demo personas are synthetic. Educational use only, not investment advice.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # engine unit tests
npm run build
```

Optional: copy `.env.example` to `.env.local` and add `ANTHROPIC_API_KEY` for AI-written Copilot answers.

## Quality

GitHub Actions runs lint, typecheck, unit tests, build and Playwright e2e on every push and PR (`.github/workflows/ci.yml`).

## Architecture

- `src/services/engine.ts`: pure, deterministic twin builder (runs on server and in the browser)
- `src/services/copilot.ts`: intent engine with affordability simulation
- `src/app/api/copilot`: validated, rate-limited route with graceful AI fallback
- Next.js 15 App Router, Tailwind v4, Recharts, light theme only

See `docs/` for PRD, pitch and demo script.
