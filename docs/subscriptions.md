# Sprout access and subscriptions

Starter has five curated modules and twenty lessons and a $10,000 virtual account. Starter cannot reset or recharge. All trading tools are Pro-only. Pro is $10 USD per month; the pricing page lists all curriculum, tools, simulator modes, analytics, rewards, community challenges, advanced Sprouty practice review and priority support requests.

The custom signup referral code gives **the new learner** $5,000 virtual cash after email confirmation, once per account within seven days. The referrer does not receive new cash rewards. Previous rewards are preserved. Bonuses and recharges are excluded from trading return calculations. Pro resets restore $10,000 and clear simulator records but retain learning.

## Activation after the website review

1. In Supabase SQL Editor run the complete `supabase/access-system.sql` file (it bundles `subscriptions.sql` and `personal-referrals.sql`). These depend on the existing account and referral migrations. Both are safe to rerun. Linked billing accounts use secure deletion that cancels their subscriptions before removing the login.
2. Create a Stripe product priced at $10 USD recurring monthly, with no trial.
3. Add the server-only Vercel environment variables `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET`. Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_APP_URL=https://sprout-trading.vercel.app`.
4. Configure the Stripe webhook at `/api/billing/webhook` for `checkout.session.completed` and `customer.subscription.created`, `.updated`, and `.deleted`. Enable the Stripe customer portal and cancellation options.
5. Redeploy and validate using Stripe test-mode checkout, a renewal event, cancellation, expired access, reset and recharge before enabling live payments.

Checkout remains disabled when configuration is incomplete. A checkout success URL never grants Pro. Pro comes from a server-verified subscription with an unexpired paid period. Subscription writes are service-role only. Webhooks verify their signature and reconcile Stripe's current subscription state, so duplicate or delayed events do not trust the event payload's claimed tier.

Cards and eligible Apple Pay/Google Pay wallets use Stripe-hosted checkout. Cash App Pay availability for recurring subscriptions must be checked in the merchant's Stripe region. PayPal requires a separate merchant integration; it is not represented as an active payment button. Do not advertise a method as available until it is enabled and tested.

## Validation and operational limits

Run `npm run lint`, `npm run test`, `npm run test:database`, `npm run build`, and the subscription browser tests. The database tests use embedded PostgreSQL and verify migrations, grants, reset/recharge authorization, existing holdings/open order rejection, repeated recharge rejection and one-time personal signup rewards.

The simulator remains an educational client-generated market. Trade data and public leaderboard snapshots are user-reported, not broker-grade execution or independently verified performance. Feature gating prevents normal access to Pro screens; the public curriculum metadata/static lesson source is not a content DRM system. API-side paid actions and entitlement changes require authenticated trusted authorization.

Priority support requests are stored in `sprout_support_requests` for operator review; there is no outbound email delivery, staffed response promise, or guaranteed response time. Review that queue before advertising human support availability. Neural tutorial files remain unchanged.
