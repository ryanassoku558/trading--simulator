# Profiles and account management

Profile details live in the existing private `paper_accounts.account` JSON: avatar selection, display name, optional display handle and bio, country/timezone, join date, achievement notification preference, and profile insight visibility. Guest details remain local; signed-in details sync with the account. Existing records remain valid. Handles are display labels, not unique logins. New guest join dates are recorded; older guest dates are not guessed. Signed-in join date comes from Supabase Auth.

The shared bottom sign-in panel is rendered only for guests. Signed-in users manage credentials and sign out in Profile. Email/password updates use Supabase Auth and require current-password reauthentication. Email updates follow Supabase confirmation requirements; passwords are never persisted in account JSON.

Learning shows completed modules/lessons, passed quiz count, streak, and Sprouty growth. Historical pass counts use completed lessons as a baseline; new passes include review quizzes. Simulator stats use recorded sell fills and journaled initial risk. Behavior score describes missing risk journal entries, closely spaced fills, and recent self-reported Tilt, not investment suitability or future performance.

Study topics use question attempts; missed-answer links are reflection prompts. Active time counts focused, recently used Learn/Simulator tabs in 15-second increments and is saved per-account on this browser, starting with this update. No historical time is estimated.

Privacy controls hide study insights, disable in-app achievement notifications, and remove user-shared leaderboard snapshots. Community posts and explicitly shared snapshots remain public until removed. No email reminder delivery is implied.

## Enable permanent deletion

Run `supabase/account-management.sql` in the Supabase SQL Editor. This creates a restricted authenticated RPC that deletes only `auth.uid()`; callers cannot supply a target user ID. Existing foreign-key cascades remove linked cloud records. The UI requires current-password reauthentication and typed DELETE confirmation. Without this migration, deletion reports that activation is needed and does not claim success. The SQL was tested in isolated PostgreSQL (PGlite) for reruns, anonymous/empty-identity rejection, confirmation enforcement, and caller-only deletion/cascades. No real user was deleted during testing.
