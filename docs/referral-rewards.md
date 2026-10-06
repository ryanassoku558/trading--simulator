# Sprout referral rewards

Rewards are **$10,000 in virtual simulation cash for each qualifying friend**. They have no cash value. There is no limit on the number of qualifying friends.

## Activate

Run [supabase/referrals.sql](../supabase/referrals.sql) in the existing project's Supabase SQL Editor. The migration is safe to rerun. It uses the existing `paper_accounts` table and does not replace existing account or community data.

The site checks whether the authenticated referral functions are installed. It shows “Coming soon” until activation. No browser-only reward or fabricated referral count is shown.

## How it works

- A signed-in user gets a private twelve-character referral code on the dashboard or Profile page.
- A new friend creates a Sprout account, confirms their email, and redeems the code within seven days of account creation.
- The database awards the referrer $10,000 in virtual cash exactly once per referred account. Self-referrals and repeat claims are rejected.
- The referrer selects “Refresh my bonus balance” or reloads to see the deposit. Concurrent account saves use the existing version check to prevent overwriting the award.
- Bonuses are recorded as deposits and excluded from trading profit and percentage return. Equity charts include deposits. An active return goal ends on an award so the deposit cannot complete the goal.
- Resetting the simulator clears virtual deposits and restores the ordinary $10,000 starting balance. Existing referral claims remain recorded and cannot be claimed again.

This verifies distinct confirmed accounts, not distinct real-world identities. These rewards are for an educational simulator; leaderboard amounts are still client-reported simulation values.

## Validation

The migration was executed twice in an isolated PostgreSQL-compatible PGlite database with mocked auth users and account rows. Two friends awarded $20,000 total. Self-referrals, duplicate claims, anonymous calls, and direct authenticated inserts were rejected. The test also checked deposit accounting and return-goal removal. No live accounts or database rows were changed during verification.

Browser tests use mocked authenticated RPC responses to check code display and redemption. Unit tests verify that deposits do not appear as trading gains. Production activation needs the SQL migration above; it cannot be applied with the project's browser publishable key.
