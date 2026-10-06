# Paperdesk — trading simulator

A responsive paper trading app with $10,000 virtual cash, six simulated stocks, price charts, buy/sell market orders, positions, returns, and trade history. Account progress is stored in your browser. Prices are generated locally and are not real market quotes. No real money is involved.

## Run

Requires Node.js 20 or later. No dependency installation is needed.

```sh
npm run dev
```

The server uses port 3000 by default; set `PORT` to override it.

```sh
npm test
```

Supabase is not connected yet. A future integration can add authentication and per-user account persistence. Never put a Supabase service-role key in browser code.

## Supabase

The browser uses the project's public publishable key in `supabase.js`. Run `supabase/schema.sql` in your project's SQL Editor to create per-user portfolio storage with row-level security. Enable email authentication in Supabase. Create an account in the app, confirm the email if requested, and sign in. Guest portfolios remain separate from signed-in portfolios. Sessions are held in memory; sign in again after reloading. Cloud portfolios are saved before a trade is shown as completed. Use one active trading tab/device at a time; simultaneous edits are not merged. This is a practice app, not a trusted financial ledger.

## Deploy to Vercel

Run `npm run build` to create the static site in `dist/`. Import this repository into Vercel. The included `vercel.json` selects the build command and output directory; no environment variables are required for the current public Supabase browser configuration. Alternatively, from a downloaded copy of the project run `npx vercel`, sign in, and deploy with `npx vercel --prod`.

After deployment, set Supabase Authentication → URL Configuration → Site URL to your production HTTPS URL. Add the same URL to Redirect URLs. Sign up in the simulator, confirm the email, then return to the deployed app and sign in. Never configure a service-role key in the browser or static build.
