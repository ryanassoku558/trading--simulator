# Sprout Trading 5.0 deployment

## Included
- Optional opt-in learning XP leaderboard. Users select a nickname and explicitly opt in; emails, IDs, portfolio holdings, and trades are not returned by the ranking RPC.
- Optional AI trade reflection endpoint that checks Supabase login and sends only symbol, side, quantity and price to the model.
- The existing deterministic Explain My Trade feature remains available without AI.
- Existing account and learning tables are unchanged.

## Required before public release
1. Apply `supabase/sprout5_leaderboard.sql` in Supabase SQL Editor. It adds a separate table and RPC with RLS.
2. Test an opted-in and opted-out account, including signing out and checking that no private data appears in the leaderboard.
3. For AI, set `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in Vercel server environment; optionally set `OPENAI_MODEL`. Without these values the endpoint returns 503 and built-in explanation remains available. The shared rate limiter caps AI requests to 10 per authenticated user per hour.
4. Before enabling AI broadly, configure OpenAI spending caps and monitor abuse; authenticated endpoints can still be abused. Upstash rate limiting is required and fails closed. Review privacy disclosures for sending trade details to a third-party model.
5. Test on Vercel Preview, then promote after successful checks.

## Known limitations
- Learning XP is currently writable by the account holder in `learning_progress`; public ranking is **not cheat-resistant**. Do not award prizes or use it for competitive payouts.
- Leaderboard is visible to signed-in users, not anonymous visitors. A nickname is public to that audience when opted in.
- AI explanations are educational, not personalized financial advice.
- Real quotes in Sprout 4 still require the separate FINNHUB_API_KEY configuration.
