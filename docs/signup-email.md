# Confirmation email delivery

Supabase email signup is enabled and requires email confirmation. The default hosted mail service is heavily rate-limited and is unsuitable for public signup traffic. A `over_email_send_rate_limit` response requires email-provider configuration, not a frontend or SQL fix.

Owner setup: Supabase project → Authentication → Email (or Email / SMTP settings) → SMTP settings → enable custom SMTP. Enter a provider-issued host, port, username and password; use a sender the provider permits. Keep all SMTP credentials in Supabase, never in browser variables or Git. Set Authentication URL configuration Site URL to https://sprout-trading.vercel.app and allow that origin as a redirect URL. Review email send limits after connecting the provider; provider limits still apply. Keep confirmation enabled for public accounts and referral verification.

For a small beta using Gmail, Google's smtp.gmail.com can be used with port 465 (SSL), the full Gmail account as username and a Google app password after enabling two-step verification. App passwords may not be available for every account; Google sending limits apply. A transactional email provider with a verified domain is preferable for sustained public traffic.

After saving, test one new signup to a mailbox you control, confirm the received link returns to Sprout, sign in and reload to verify cloud progress. Do not repeatedly click Create account while rate-limited. Connecting SMTP may not instantly clear an existing rate-limit window.
