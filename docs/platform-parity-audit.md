# Platform parity audit — Sprout inventory and reference dependency

Status: Sprout inventory completed. Working reference: https://www.stocktrak.com/, identified from the StockTrak reference already used earlier in this project. The user can correct this URL. The public homepage, robots file and sitemap index have been fetched successfully. Public-page verification is in progress; no private workflows or restricted course contents have been assumed. Restricted pages will be listed with the screenshots or authorized access needed.

The exhaustive content index is [sprout-content-inventory.json](sprout-content-inventory.json): 41 modules, 159 lessons and 80 glossary terms, plus the tutorial catalogs. Reproduce it with `node scripts/export-platform-inventory.mjs`. It reads repository content only, never user accounts or portfolios.

## Existing Sprout inventory (not a claim about the reference)

| Area | Existing capability and entry points | Evidence / limits |
| --- | --- | --- |
| Public information | `/` uses the complete About content, account creation/sign-in and optional guest entry; `/about`, the legacy `/welcome` onboarding entry, `/pricing`, `/support`, `/privacy`, `/terms`, `/cancellation` | `MarketingHome.tsx`, `About.tsx`, `Policies.tsx`, `Subscription.tsx`. The root opens a personal dashboard for restored signed-in sessions. |
| Personal workspace | `/dashboard`, `/profile`, `/settings`, `/achievements` | Existing account state, profile, privacy preferences, XP, streaks, milestones and progress. Dashboard numbers use saved account data. |
| Curriculum | `/learn`, module/lesson/glossary/tutorial query views and direct `?lesson=` links | 41 modules and 159 lessons, original examples/explanations/questions, five-question presentation checks, 80% pass threshold and next-module continuation. Starter/Pro gates remain enforced. `lib/education`, `lib/billing/curriculum.ts`. |
| Topic breadth | Trading basics; chart reading; order execution; risk; long-term investing; market structure; valuation; macro context; strategy testing; habits; public insider transactions; crypto; derivative concepts | Verified lesson/module source, not an assertion of complete coverage versus the reference. Options/futures topics do not imply executable contract support. |
| Tutorials and study | `/learn?view=Tutorials`, `/play`, flashcards, matching, definition quizzes, solo quests | 11 topic-tutorial entries and 20 onboarding-tutorial entries; original local video/transcript assets. `TutorialHub`, `StudyCoach`, `GlossaryPractice`, `PracticeQuest`. Verify counting conventions against actual visible catalog. |
| Hosted games | `/play?mode=Live%20quiz`, guest room-code joins, signed-in hosts | Custom questions/answers, full-curriculum topic selection, editable/reorderable drafts, configurable time, no fixed 20-question ceiling, synchronized rounds and podium. Server grading/private room state in `lib/games/live.sql`. “Live” refers to multiplayer synchronization, not exchange data. |
| Classroom journeys | `/classrooms`, `/assignments/:id`, `/classrooms?view=resources` | Create/join by code, assignments/deadlines, targeted review, five-question checks, simulator missions/reflections, teacher feedback, class-scoped reporting/CSV, printable session planner. Roster aliases and data are scoped to the class. |
| Audience paths | Teachers/students/families entry points; `/classrooms?view=schools` | Current overview aggregates only classes owned by the signed-in account. No cross-account district admin, organization SSO, institutional rostering integration or school-wide service entitlement is implied. Separate earlier extensions remain an unpublished draft. |
| Asset discovery | `/market`, `/market/:ticker`, global and simulator search, shortcuts, watchlist | Catalog contains 11,787 US security rows plus five crypto practice assets. Listing provenance/current listing status must be verified before claiming current exchange coverage. Commodity shortcuts are funds, not directly delivered commodities. |
| Generated practice data | Quote clock, chart history, OHLC candles, activity pane, ticker | `lib/market/index.ts`, `lib/chart/analysis.ts`. Deterministic generated prices seeded by static catalog values; two-second ticks. No exchange quote API backs virtual execution. Simulated data is labeled and a simulation timestamp is shown. |
| External quotes | `/market` → Real market quotes | TradingView’s official external market-quotes widget and attributed provider links. Symbols span stocks, ETFs, crypto and continuous futures references. Delays/timestamps depend on the provider/exchange. Research quotes do not set simulator fills. No raw provider data is scraped or republished. |
| Company research | Asset description, research link to Yahoo Finance, metric definitions | Current fundamentals are not connected. Old undated example market-cap/volume values have been removed from the visible company panel. No invented fundamentals are presented as current. |
| Chart tools | Candles/line/OHLC/Heikin-Ashi, horizons/intervals, crosshair/zoom/navigation/fullscreen, settings, indicator panels, drawings, planned risk/reward, replay, tags/alerts/comparison | Existing free/Pro access applies. Indicator/activity inputs are generated. Alerts require the page to remain open; replay is chart-only; planning lines are not executable orders. Guided tour spotlights actual controls and honors reduced motion. |
| Order workflow | Virtual buys/sells, market orders, limit orders, review/confirmation, fill/cancel status | Long-only stock/ETF whole-share practice; fractional quantities for supported crypto assets. No live brokerage execution, borrow/shorting engine, executable options/futures contracts or forex pairs verified in the current engine. |
| Portfolio and review | `/portfolio`, `/history`, `/practice`, account summary, holdings/allocation, snapshots, realized/unrealized return, journal/emotion/risk notes | `lib/trading/index.ts`, `analytics.ts`, `Practice.tsx`. Win rate, best/worst closed trades, average recorded R, drawdown and goals are computed from saved practice state, not customer performance claims. |
| Planning tools | `/tools`, `/practice`, position sizing, planned risk, hypothetical P/L, generated volatility, chart practice and habits | `VisualTools.tsx`, `PracticeVisuals.tsx`, `ChartPractice.tsx`. No research scanner/news feed is implied by educational examples. |
| Search/navigation | Asset search, curriculum search/filter/pagination, module/lesson links, contextual assignment return paths | Existing query routes preserve assignment context. Learn/Today navigation entries are removed by request, but content URLs remain. Educator resources are inside Classrooms. |
| Accounts and billing | Supabase Auth, cloud/local progress, profile/settings/account deletion, Pro checks, Stripe integration code | `lib/storage`, `lib/billing`, `app/api/billing`. Do not change account format or reset user data for parity work. Actual checkout availability follows existing configuration. |
| Assistance/support | Sprouty concept help, optional OpenAI-backed answers with sourced web research, support links | `app/api/assistant`, `lib/support`. The API key is server-only; a local-answer fallback exists. This is not a verified market news product or institution-specific AI service. |

## Gaps found independently in Sprout

- There is no verified first-party fundamentals feed for market capitalization, volume, financial statements, ratios or company events. Removed visible undated sample metrics rather than presenting them as current.
- No dedicated news feed, economic/earnings calendar or fundamental screener page was found in the route/component inventory. Whether any is in scope depends on verifying the reference.
- Exchange data for virtual fills is not connected. Switching saved portfolios to a new valuation feed would require an explicit compatibility/migration plan; do not silently reprice historical fills or balances.
- Data-provider credentials, subscriptions, exchange entitlements, redistribution/display rights and timestamp/delay requirements must be identified per verified integration. The existing embedded quote widget is distinct from an API license for simulator execution or fundamentals.
- Asset catalog provenance, listing refresh process, corporate-action handling and vendor licensing need verification before production claims of full current market coverage.

## Reference comparison checklist — public audit in progress

- [x] Identify the working reference from the prior project source: https://www.stocktrak.com/. Await any correction from the user.
- [ ] Read public navigation, sitemap and public product documentation; inventory distinct pages/workflows with URLs and access dates.
- [ ] Verify each offered capability directly; distinguish marketing statements, working public UI, gated demonstrations and inaccessible pages.
- [ ] List restricted areas precisely and request screenshots or authorized access without inferring their contents.
- [ ] Produce a verified-only matrix: reference capability/evidence → existing Sprout implementation → implementation gap → data/licensing dependency → test.
- [ ] Implement verified gaps using original code/content and appropriately licensed or attributed data.
- [ ] Test browsing/search, learning/completion, research accuracy/freshness, orders/portfolio persistence, auth/account switching, classroom access and phone layouts.

Do not claim full parity until verified public gaps are implemented and restricted/integration dependencies have been resolved.
