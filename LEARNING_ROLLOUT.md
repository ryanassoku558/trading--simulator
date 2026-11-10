# Learning progress migration and test checklist

This branch is a preview; do not merge to main until validated.

## Database migration
In the **existing** Supabase project's SQL Editor, run `supabase/learning_progress.sql`.
It creates a new table with RLS and does not modify `paper_accounts`.
No service-role key belongs in the browser.

## Preview checks
1. Verify Vercel builds this branch and serves `/learning.js`.
2. As a guest, complete a lesson and refresh: XP should persist.
3. Sign in: guest XP must not overwrite the cloud user's XP.
4. Complete a lesson while signed in; refresh and sign in again: cloud XP should persist.
5. Sign out: guest progress should reappear.
6. Repeat a completed lesson or passed quiz: no duplicate XP.
7. Complete module 1 and pass its quiz with 4/5: module 2 unlocks.
8. Verify a second account cannot read or update the first account's learning row.
9. Verify buy/sell, portfolio persistence, sign-in/out, and reset continue to work.
10. Confirm no deployment of main occurred.

## Limitations
The current learning curriculum is a preview (six lessons, two quizzes). Learning saves are queued in the browser; simultaneous tabs/devices are not reconciled. Supabase sessions are currently memory-only, requiring sign-in after reload. If a cloud save fails, further learning edits are disabled until the next successful sign-in. Existing guest progress is not automatically migrated to a signed-in account.
