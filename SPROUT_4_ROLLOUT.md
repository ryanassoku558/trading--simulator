# Sprout Trading 4.0 — rollout guide

## Included
- Optional market quote snapshots (Finnhub), with clear source and timestamps. Virtual trades remain virtual.
- Simulated market fallback when no API key is configured or quotes fail.
- Short, medium and long chart windows (these are **recent app-observed prices**, not real historical candles).
- Explain My Trade educational rule-based reflection (not an AI model).
- Practice challenges and private on-device stats. No public leaderboard or private account information is exposed.

## Configure optional market quotes
1. Obtain your own Finnhub API token and review the provider's license, quotas and attribution requirements.
2. In Vercel Project Settings → Environment Variables, add `FINNHUB_API_KEY` for Preview and Production. Never put it in `supabase.js` or browser source.
3. Redeploy the preview, select **Market quotes**, and check the quote timestamp and fallback behavior.
4. Vercel serves `api/quotes.js` as a serverless function. The endpoint intentionally returns 503 until the key is configured.

## Important limits
- Market quotes may be delayed or stale and do not make this a real brokerage.
- The chart shows sampled quotes, not exchange OHLC/candlestick history.
- Public cross-user leaderboards require opt-in, a privacy model, secure RLS policies and anti-cheat measures; intentionally not enabled.
- AI-generated Explain My Trade requires a server-side model service, abuse controls and a separate cost/security review. The included explanation is deterministic and private.
- Test sign-in, progress, trades, quote mode, fallback, and mobile layout on Vercel Preview before merging to main.
