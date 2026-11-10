-- Sprout community migration. Run in Supabase SQL Editor; safe to rerun.
begin;
create table if not exists public.community_posts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 author text not null check (char_length(author) between 1 and 60),
 kind text not null check (kind in ('discussion','strategy','chart')),
 title text not null check (char_length(title) between 1 and 140),
 body text not null check (char_length(body) between 1 and 4000),
 markup jsonb not null default '[]'::jsonb check (jsonb_typeof(markup)='array' and jsonb_array_length(markup)<=20),
 created_at timestamptz not null default now()
);
create table if not exists public.community_replies (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.community_posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 author text not null check (char_length(author) between 1 and 60),
 body text not null check (char_length(body) between 1 and 2000),
 created_at timestamptz not null default now()
);
create table if not exists public.community_votes (
 post_id uuid not null references public.community_posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 primary key (post_id,user_id)
);
create table if not exists public.community_scores (
 user_id uuid not null references auth.users(id) on delete cascade,
 challenge text not null check (challenge in ('plan-3','seven-days')),
 author text not null check (char_length(author) between 1 and 60),
 score integer not null check (score between 0 and 7),
 updated_at timestamptz not null default now(),
 primary key (user_id,challenge),
 check (challenge <> 'plan-3' or score <= 3)
);
create table if not exists public.community_reports (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.community_posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 reason text not null check (char_length(reason) between 1 and 500),
 created_at timestamptz not null default now(),
 unique (post_id,user_id)
);
alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;
alter table public.community_votes enable row level security;
alter table public.community_scores enable row level security;
alter table public.community_reports enable row level security;
revoke all on public.community_posts,public.community_replies,public.community_votes,public.community_scores,public.community_reports from anon,authenticated;
grant select on public.community_posts,public.community_replies,public.community_votes,public.community_scores to anon,authenticated;
grant insert,delete on public.community_posts,public.community_replies,public.community_votes to authenticated;
grant insert,update,delete on public.community_scores to authenticated;
grant insert on public.community_reports to authenticated;
drop policy if exists "Public posts" on public.community_posts;
create policy "Public posts" on public.community_posts for select using (true);
drop policy if exists "Own posts insert" on public.community_posts;
create policy "Own posts insert" on public.community_posts for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Own posts delete" on public.community_posts;
create policy "Own posts delete" on public.community_posts for delete to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Public replies" on public.community_replies;
create policy "Public replies" on public.community_replies for select using (true);
drop policy if exists "Own replies insert" on public.community_replies;
create policy "Own replies insert" on public.community_replies for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Own replies delete" on public.community_replies;
create policy "Own replies delete" on public.community_replies for delete to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Public votes" on public.community_votes;
create policy "Public votes" on public.community_votes for select using (true);
drop policy if exists "Own votes insert" on public.community_votes;
create policy "Own votes insert" on public.community_votes for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Own votes delete" on public.community_votes;
create policy "Own votes delete" on public.community_votes for delete to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Public scores" on public.community_scores;
create policy "Public scores" on public.community_scores for select using (true);
drop policy if exists "Own scores insert" on public.community_scores;
create policy "Own scores insert" on public.community_scores for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Own scores update" on public.community_scores;
create policy "Own scores update" on public.community_scores for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "Own scores delete" on public.community_scores;
create policy "Own scores delete" on public.community_scores for delete to authenticated using ((select auth.uid())=user_id);
drop policy if exists "Own reports insert" on public.community_reports;
create policy "Own reports insert" on public.community_reports for insert to authenticated with check ((select auth.uid())=user_id);
create or replace view public.community_vote_counts with (security_invoker=true) as select post_id,count(*)::integer as votes from public.community_votes group by post_id;
grant select on public.community_vote_counts to anon,authenticated;
create index if not exists community_posts_kind_created on public.community_posts(kind,created_at desc);
create index if not exists community_replies_post_created on public.community_replies(post_id,created_at);

-- Learner reviews: one per signed-in account, editable by its author.
create table if not exists public.learner_reviews (
 user_id uuid primary key references auth.users(id) on delete cascade,
 author text not null check (char_length(author) between 1 and 60),
 rating integer not null check (rating between 1 and 5),
 body text not null check (char_length(body) between 10 and 1500),
 consent boolean not null check (consent=true),
 updated_at timestamptz not null default now()
);
alter table public.learner_reviews enable row level security;
revoke all on public.learner_reviews from anon,authenticated;
grant select on public.learner_reviews to anon,authenticated;
grant insert,update,delete on public.learner_reviews to authenticated;
drop policy if exists "Public learner reviews" on public.learner_reviews;
create policy "Public learner reviews" on public.learner_reviews for select using (consent=true);
drop policy if exists "Own review insert" on public.learner_reviews;
create policy "Own review insert" on public.learner_reviews for insert to authenticated with check ((select auth.uid())=user_id and consent=true);
drop policy if exists "Own review update" on public.learner_reviews;
create policy "Own review update" on public.learner_reviews for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id and consent=true);
drop policy if exists "Own review delete" on public.learner_reviews;
create policy "Own review delete" on public.learner_reviews for delete to authenticated using ((select auth.uid())=user_id);

-- Opt-in portfolio leaderboard snapshots; no emails or account JSON are public.
create table if not exists public.community_portfolios (
 user_id uuid primary key references auth.users(id) on delete cascade,
 author text not null check (char_length(author) between 1 and 60),
 equity numeric(16,2) not null check (equity >= 0 and equity <= 1000000000000),
 updated_at timestamptz not null default now()
);
alter table public.community_portfolios enable row level security;
revoke all on public.community_portfolios from anon,authenticated;
grant select on public.community_portfolios to anon,authenticated;
grant insert,update,delete on public.community_portfolios to authenticated;
drop policy if exists "Public portfolio snapshots" on public.community_portfolios;
create policy "Public portfolio snapshots" on public.community_portfolios for select using (true);
drop policy if exists "Own portfolio insert" on public.community_portfolios;
create policy "Own portfolio insert" on public.community_portfolios for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists "Own portfolio update" on public.community_portfolios;
create policy "Own portfolio update" on public.community_portfolios for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists "Own portfolio delete" on public.community_portfolios;
create policy "Own portfolio delete" on public.community_portfolios for delete to authenticated using ((select auth.uid())=user_id);
commit;
