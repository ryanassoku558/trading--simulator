# Beginner guidance and Play & study

The existing Home, curriculum, navigation, accounts and trading experience remain. Home now explains the first action in plain language; existing path steps describe what to do next. The Play & study entry is available on Home and under More resources.

## Modes

- Practice quest: five untimed questions from an existing Starter module, answer explanations, a correct-answer streak, and round-only stars. No lesson XP or account balances change.
- Learn & review: six beginner words, examples, understanding checks, and one bounded review of missed terms. Original flashcards, matching and definition quizzes remain available below.
- Live quiz: any signed-in account can create a room. Guests enter its six-character code and a nickname without creating an account. The host starts, reveals answers and advances the chosen questions, with no fixed question-count cap, with a final leaderboard. Players can refresh to reconnect.

## Live service

`app/api/live/route.ts` uses the existing server-only Supabase configuration. `lib/games/live.sql` was applied as `sprout_live_quiz_rooms`. Room, player and answer tables live in the unexposed `sprout_live` schema, have RLS enabled, and grant access only to `service_role`. Public RPC functions use security invoker and also grant execution only to `service_role`; browsers cannot call them directly.

The API verifies a host's Supabase session through the existing `identify` helper. Guests use a random HttpOnly, Secure, SameSite=Lax cookie; only its SHA-256 hash is stored. Room mutations lock the room row. Only one answer per player/question is scored, using the database clock. Correct answers earn 1,000 points plus up to 200 for remaining time. Answer keys, explanations and current-question points are withheld until reveal; future questions are never returned by the live API. A stale question index cannot advance or score the wrong question. Hosts cannot control another account's room.

State refreshes every two seconds, with immediate refresh after the user's actions. Rooms expire after two hours, accept up to 50 players in the waiting room, and cap hosts at three active rooms and ten new games per hour. Expired room records and their player/answer records are removed when that host next creates a room. This release has not been load-tested with 50 simultaneous players.

The legacy `sprouttrading.vercel.app` alias has no server secrets. Its live API forwards only to the fixed main production live API, passing the game cookie and authorization header; the main service verifies them. It does not copy or expose server keys. Other deployments require the existing production Supabase server configuration.

## Verification

Unit/API/database tests cover host authentication, forged host IDs, guest cookies, origin checks, legacy forwarding, server-role permissions, room isolation, hidden answers/scores, duplicate scoring, timeouts, and custom 1-, 3-, 25-question boundaries as well as the original five-question boundary. Browser tests use three independent contexts (host plus two guests) and the real game SQL in PGlite, including host question/answer editing, joining, reconnecting, all three custom rounds and the final board. Other browser checks cover beginner navigation, quests, study, mobile overflow and the unchanged 41-module/159-lesson catalog. The live database RPC permissions and scoring were checked in a rollback-only transaction.

Real-account host login is not automated in these tests; its existing Supabase authentication helper is reused and API tests provide the verified-user fixture. Production guest connectivity is checked separately after deployment with a temporary room that is ended afterward and follows the normal two-hour expiry and host cleanup lifecycle.

The Supabase advisor's RLS-with-no-policy INFO notices on the three private game tables are intentional deny-all browser access: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy. No permissive policy was added to silence them. Pre-existing notices on unrelated functions and auth settings remain outside this change.

Run `npm test`, `npm run build`, then the browser tests against a running app:

`TEST_BASE_URL=http://127.0.0.1:3000 TEST_CHROMIUM_PATH=/path/to/chromium npx playwright test tests/games.e2e.ts tests/restored-content.e2e.ts tests/focused-feedback.e2e.ts`

Hosts can edit every question, provide 2–4 distinct answer choices, mark the correct answer, and add an optional explanation and quiz name before creating the room. The API normalizes and validates all custom content (300-character questions, 150-character choices, 600-character explanations; 2 MiB upload size limit). Topic presets still start with five existing questions. Hosts can append custom questions or five questions from a topic, choose timers from 5–240 seconds, and enter full-screen mode. Live tiles, question entrances, lobby arrivals, answer-count bars, final-seconds pulses and the winners’ podium respect reduced-motion preferences.

Incremental hosted migration: `lib/games/custom-questions.sql` (`sprout_live_custom_question_counts`). Existing five-question rooms remain valid. The hosted one-question custom answer/reveal/finish flow passed in a rollback-only transaction.

Follow-up migration `sprout_live_open_question_count` removes the count/index ceiling and adds reveal-only answer distributions. Upload size is bounded to 2 MiB; there is no 20-question product limit.
