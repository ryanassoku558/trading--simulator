# Beginner guidance and Play & study

The existing Home, curriculum, navigation, accounts and trading experience remain. Home now explains the first action in plain language; existing path steps describe what to do next. The Play & study entry is available on Home and under More resources.

## Modes

- Practice quest: five untimed questions from an existing Starter module, answer explanations, a correct-answer streak, and round-only stars. No lesson XP or account balances change.
- Learn & review: six beginner words, examples, understanding checks, and one bounded review of missed terms. Original flashcards, matching and definition quizzes remain available below.
- Live quiz: any signed-in account can create a room. Guests enter its six-character code and a nickname without creating an account. The host starts, reveals answers and advances the five questions, with a final leaderboard. Players can refresh to reconnect.

## Live service

`app/api/live/route.ts` uses the existing server-only Supabase configuration. `lib/games/live.sql` was applied as `sprout_live_quiz_rooms`. Room, player and answer tables live in the unexposed `sprout_live` schema, have RLS enabled, and grant access only to `service_role`. Public RPC functions use security invoker and also grant execution only to `service_role`; browsers cannot call them directly.

The API verifies a host's Supabase session through the existing `identify` helper. Guests use a random HttpOnly, Secure, SameSite=Lax cookie; only its SHA-256 hash is stored. Room mutations lock the room row. Only one answer per player/question is scored, using the database clock. Correct answers earn 1,000 points plus up to 200 for remaining time. Answer keys, explanations and current-question points are withheld until reveal; future questions are never returned by the live API. A stale question index cannot advance or score the wrong question. Hosts cannot control another account's room.

State refreshes every two seconds, with immediate refresh after the user's actions. Rooms expire after two hours, accept up to 50 players in the waiting room, and cap hosts at three active rooms and ten new games per hour. Expired room records and their player/answer records are removed when that host next creates a room. This release has not been load-tested with 50 simultaneous players.

The legacy `sprouttrading.vercel.app` alias has no server secrets. Its live API forwards only to the fixed main production live API, passing the game cookie and authorization header; the main service verifies them. It does not copy or expose server keys. Other deployments require the existing production Supabase server configuration.

## Verification

Unit/API/database tests cover host authentication, forged host IDs, guest cookies, origin checks, legacy forwarding, server-role permissions, room isolation, hidden answers/scores, duplicate scoring, timeouts, and the five-question boundary. Browser tests use three independent contexts (host plus two guests) and the real game SQL in PGlite, including joining, reconnecting, all five rounds and the final board. Other browser checks cover beginner navigation, quests, study, mobile overflow and the unchanged 41-module/159-lesson catalog. The live database RPC permissions and scoring were checked in a rollback-only transaction.

Real-account host login is not automated in these tests; its existing Supabase authentication helper is reused and API tests provide the verified-user fixture. Production guest connectivity is checked separately after deployment with a temporary room that is deleted afterward.

The Supabase advisor's RLS-with-no-policy INFO notices on the three private game tables are intentional deny-all browser access: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy. No permissive policy was added to silence them. Pre-existing notices on unrelated functions and auth settings remain outside this change.

Run `npm test`, `npm run build`, then the browser tests against a running app:

`TEST_BASE_URL=http://127.0.0.1:3000 TEST_CHROMIUM_PATH=/path/to/chromium npx playwright test tests/games.e2e.ts tests/restored-content.e2e.ts tests/focused-feedback.e2e.ts`
