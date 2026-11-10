# Sprout progression and trading desk

The homepage shows course completion, XP level, the next learning step, individual achievements, and a 20 XP daily goal. Completing the course changes the goal to practicing in the simulator. Achievements include the learner's longest three-day streak, so earning that milestone persists after an active streak ends.

Each knowledge check presents five questions, one at a time. Four correct answers pass the module; a first pass earns 50 XP and unlocks the next chapter. Failed attempts offer retry and lesson review. Retaking a passed quiz does not award duplicate XP. Learning saves preserve the existing guest/account separation and add daily XP inside the existing progress JSON.

The simulator adds a current-session equity chart, cash/stock allocation, concentration guidance, stock search, holding prices and weights, order buying power and impact, quantity shortcuts, holding-to-order navigation, and buy/sell history filters. The chart records observed session values; it does not claim historical portfolio performance. Switching quote sources starts a new chart series.

## Database

`supabase/sprout5_leaderboard.sql` fixes the previous malformed migration and was applied as `sprout_opt_in_rankings`. Participation is opt-in. Owner-only profile RLS and an authenticated-only, security-invoker public RPC expose chosen nicknames and XP. The privileged aggregate is in an unexposed private schema, requires a user identity, and returns no account IDs, emails, portfolios, or progress JSON. XP remains self-reported; rankings must not be used for prizes or financial rewards.

## Verification

- `npm test`: 7 existing tests.
- `npm run build` and JavaScript syntax checks.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`: full-course progression, fail/retry, unanswered questions, no duplicate XP, daily goals, achievements, guest reload, stock search, quantity shortcuts, buying/selling, overspending/overselling, holdings, order filters, mobile overflow, quote switching/fallback, and no browser errors.
- Authenticated browser behavior uses a deterministic API fixture: signed-in saves, guest isolation, re-login, and failed-save protection. A real browser login was not exercised.
- Live PostgreSQL rollback-only tests: opted-in ranking, opt-out exclusion, own-profile/progress isolation, blocked cross-user updates, and missing-user guard. All fixture changes were rolled back.
- Security advisor results showed no new notices for the new leaderboard objects. Existing notices remain for unrelated referral/community functions and disabled leaked-password protection; they were not changed in this release. References: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable and https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

Optional live quotes and AI coaching still require the server credentials documented in `SPROUT_4_ROLLOUT.md` and `SPROUT_5_ROLLOUT.md`; the simulator and built-in trade explanation remain usable without them.

To run browser tests locally: `npm ci`, `npx playwright install chromium`, then `npm run test:browser`. `TEST_BASE_URL` may target an already running server.
