-- Run once in Supabase SQL Editor. Safe to rerun.
create table if not exists public.paper_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.paper_accounts enable row level security;
revoke all on public.paper_accounts from anon;
grant select, insert, update on public.paper_accounts to authenticated;
drop policy if exists "Read own account" on public.paper_accounts;
create policy "Read own account" on public.paper_accounts for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Create own account" on public.paper_accounts;
create policy "Create own account" on public.paper_accounts for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own account" on public.paper_accounts;
create policy "Update own account" on public.paper_accounts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
