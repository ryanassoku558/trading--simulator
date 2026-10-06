# Sprout — trading simulator

A beginner-friendly stock education and paper-trading app. Learn in small steps, practice with **$10,000 in virtual cash**, and understand every trade. Educational simulation only: no real money, financial advice, or promised returns.

## Features

- First-run landing page and experience-based onboarding; automatic Beginner Mode for new learners.
- Dashboard with account value, cash, invested value, daily change, total return, watchlist, recent trades, learning progress, and market examples.
- All 25 lessons across five levels, examples, explanations, quizzes, accuracy, learning streak, XP, level-completion bonuses, and six achievements.
- Searchable market with ten seeded stocks/funds, company descriptions, interactive charts, five timeframes, and watchlist controls.
- Whole-share market buys and sells, weighted average cost, realized/unrealized gains, friendly validation, and Beginner Mode confirmations.
- Pending limit orders, cancellation, and deterministic market advancement. Every fill opens **Explain My Trade**, including 5%/10% price and dollar scenarios. History can reopen explanations.
- Holdings, portfolio allocation, performance chart, profile settings, simulator reset, and separate learning reset.
- Responsive desktop/mobile navigation, native modal focus handling and Escape dismissal, reduced-motion support, loading/error/empty states, and local persistence.

## Stack and setup

Next.js App Router, React, strict TypeScript, Tailwind CSS 4 plus shared design tokens, Recharts, and Lucide. npm is the package manager; the lockfile is included. Node **24** is recommended (the browser-test package requires Node 22.17+).

```bash
npm ci
npm run dev
```

The development server listens on port 3000. For production:

```bash
npm run build
npm start
```

## Demo mode and environment variables

**No environment variables or external credentials are required.** The app starts in local demo mode. It has no sign-up or password requirement and makes no market API calls. State is saved under `sprout-trading-v1` in this browser’s localStorage: onboarding, balance, holdings, trades, orders, watchlist, snapshots, and learning progress. Saved data is validated before loading, with a recovery action for corruption. Open tabs synchronize account changes. Clearing browser data removes the account. Different devices and browsers have separate accounts.

There are no configured Supabase credentials in the supplied environment, so remote authentication and database synchronization are not enabled in this MVP. Do not assume adding keys will automatically switch storage backends.

### Connecting Supabase in a future integration

The replacement boundaries are `StateStorage` in `lib/storage/index.ts`, the account store in `lib/storage/useAccount.ts`, and the domain interfaces in `types/index.ts`. To add hosted accounts:

1. Add a Supabase browser/server client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or the project’s publishable key). Keep service-role credentials server-side; never expose them in browser bundles.
2. Implement sign-up/login/logout and bind persisted state to `auth.uid()`.
3. Create profile, account, trade, order, and learning tables (or a versioned account-state document) with row-level security restricting reads/writes to the authenticated owner.
4. Replace the synchronous browser storage with an asynchronous loading/saving adapter, preserving local fallback and clear synchronization errors.
5. Move trade execution into an atomic database transaction/server operation before supporting shared account access. Test auth, reload persistence, and concurrent orders with real configured credentials.

No secrets are checked in, and no Supabase functionality is claimed as tested.

## Market and trading behavior

`lib/market/index.ts` owns ten realistic seeded base quotes and deterministic chart samples. These are **illustrations, not actual historical or live prices**. The selected timeframe controls the scale of simulated price variation. `Advance market` increments a persisted tick and changes quotes by a bounded deterministic formula; prices never change randomly during rendering. Market overview numbers are static seeded examples.

Market orders fill immediately at the current quote, without fees or slippage. Whole shares only; no margin, shorting, or fractional shares. Prices and cash transactions are rounded to cents. Weighted average cost retains precision internally and is formatted to cents in the UI.

Limits remain pending until **Advance market** makes the quote satisfy the buy-at-or-below/sell-at-or-above condition. Even a currently marketable limit waits for this manual step. No cash or shares are reserved. At a trigger, resources are checked again; insufficient-resource orders cancel. Limits far from the bounded seeded prices may never fill. Orders are evaluated newest first; multiple fills each receive their own explanation dialog. Stop orders are taught but not implemented.

Portfolio value equals cash plus current holdings. Total return is measured against the original $10,000. Today’s gain/loss estimates current holdings’ movement from the simulated previous daily close, rather than an exact intraday account ledger. Sell explanations show realized profit/loss and clearly label future scenarios as hypothetical.

`MarketDataProvider` separates quotes/history from components. A real provider should fetch/cache normalized quotes and historical data through a server endpoint, keep API secrets server-side, display market timestamps, and add loading/stale/error handling. Update the financial engine to use execution-time validated prices rather than trusting client quotes.

## Architecture

- `app/`: route entry point, layout, loading and error boundaries, responsive design system.
- `components/screens/`: landing, dashboard, market, stock detail, portfolio, trade history, achievements, preferences.
- `components/Simulator.tsx`: navigation and application coordination.
- `components/Learning.tsx`, `Trading.tsx`, `Chart.tsx`, `Dialog.tsx`, `ui/`: reusable interactive UI.
- `lib/trading/`: single source for account initialization, buy/sell validation, weighted cost, portfolio values, limits, and trade scenarios.
- `lib/market/`: deterministic seeded data and replaceable provider interface.
- `lib/education/`: 25 lessons, quizzes, completion/XP/streak rules, and achievements.
- `lib/storage/`: persistence adapter and hydration-safe React account subscription.
- `types/`: users, profiles, preferences, accounts, stocks/history, holdings, trades/orders, lessons/quizzes, attempts/progress, and achievements.
- `tests/`: financial/learning/storage unit tests and browser journeys.

Lesson XP is awarded once per correct first completion: 35 XP; completing a full level adds 100 XP. The first completed trade adds 50 XP. Correct retries of completed lessons do not add XP. Quiz accuracy includes all attempts. A learning day is based on UTC dates.

## Verification

```bash
npm run lint
npm run typecheck # Generates Next.js route types before checking TypeScript
npm test
npm run build
```

Start the app, then run browser tests in another terminal:

```bash
npm run dev
npm run test:e2e
```

Linux browser tests use npm-packaged Chromium, avoiding an additional browser download. On other operating systems, install Playwright Chromium with `npx playwright install chromium` first. `TEST_BASE_URL` can target a running production server on another port. The tests cover onboarding, a lesson/quiz, guided first trade, buy/sell math and validation, every main route, limit execution, history explanations, reload persistence, resets, mobile navigation, search, horizontal layout overflow, corrupt-data recovery, accessible dialog dismissal, and synchronization between open tabs. Screenshots are written to the system temporary directory.

This is an educational local MVP. Hosted authentication, multi-device persistence, real market data, stop orders, dividends, fees, splits, tax calculations, and professional trading features remain future work.
