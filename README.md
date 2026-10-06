# Sprout — trading simulator

A beginner-friendly stock education and paper-trading app. Learn in small steps, practice with **$10,000 in virtual cash**, and understand every trade. Educational simulation only: no real money, financial advice, or promised returns.

## App preview

**[Open the full gallery: 28 pictures and 4 videos](docs/previews/README.md)**

You can view the screenshots and moving previews on GitHub without downloading the app.

### Dashboard

![Sprout dashboard with a $10,000 virtual practice account](docs/preview.png)

### Video previews

#### From welcome to your first lesson and trade

[![Moving preview: From welcome to your first lesson and trade](docs/previews/01-first-steps.gif)](docs/previews/01-first-steps.mp4)

#### Buying, tracking a portfolio, and selling

[![Moving preview: Buying, tracking a portfolio, and selling](docs/previews/02-portfolio-trading.gif)](docs/previews/02-portfolio-trading.mp4)

#### Explore stocks, charts, watchlists, and limit orders

[![Moving preview: Explore stocks, charts, watchlists, and limit orders](docs/previews/03-market-limit-orders.gif)](docs/previews/03-market-limit-orders.mp4)

#### A complete tour on a phone-sized screen

[![Moving preview: A complete tour on a phone-sized screen](docs/previews/04-mobile-tour.gif)](docs/previews/04-mobile-tour.mp4)

### More screens

#### Welcome page

![Welcome page](docs/previews/01-landing.png)

#### Understand price moves and position size

![Understand price moves and position size](docs/previews/09-explain-trade.png)

#### Three-stock portfolio, returns, and allocation

![Three-stock portfolio, returns, and allocation](docs/previews/11-portfolio.png)

#### Ten simulated stocks and funds

![Ten simulated stocks and funds](docs/previews/15-market.png)

#### First Lesson, First Trade, and Portfolio Builder

![First Lesson, First Trade, and Portfolio Builder](docs/previews/12-achievements.png)

[View all desktop and mobile screenshots](docs/previews/README.md)

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

## Accounts and Supabase

The app supports both local guest practice and Supabase email accounts. **Save your progress** appears on the welcome page and dashboard. Create an account, confirm your email if required, and sign in. Supabase's client restores sessions across reloads and refreshes access tokens. Signed-in portfolio and learning progress are stored in `public.paper_accounts`, with owner-only row-level security. Guest data stays separate and is never automatically uploaded or overwritten when you sign in.

The project owner's public Supabase URL and publishable key are defaults in `lib/supabase/client.ts`; these browser credentials are not secret. Optional build-time overrides are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Never use service-role or secret keys in browser configuration.

Run `supabase/schema.sql` in the Supabase SQL Editor before using cloud accounts. In Authentication → URL Configuration, set Site URL to your deployed HTTPS origin and add it to Redirect URLs. Enable email authentication. Email delivery and confirmation depend on the project's Supabase settings.

Signed-in changes save asynchronously. A saving overlay blocks new actions until saving finishes. Failed saves revert to the prior state and show an error. Saves compare `updated_at` atomically so a stale tab/device cannot overwrite newer data; reload after a conflict. State is validated when loading. Cloud loading failure blocks trading until you retry or sign out. This is an educational simulator: the browser calculates trades and users can edit their own state, so it is not a trusted financial ledger.

For guests, state uses `sprout-trading-v1` in localStorage and open tabs synchronize changes. Clearing browser data removes guest progress; guest accounts are separate across browsers/devices.

## Deploying this version

Import this repository into Vercel using the `sprout-supabase` branch, with framework **Next.js**, default `npm run build`, and no custom output-directory override. The previous directly uploaded demo will not change automatically unless its Vercel project is connected to this repository and branch or this branch is deployed separately.

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

This is an educational local MVP. Real market data, stop orders, dividends, fees, splits, tax calculations, and professional trading features remain future work.
