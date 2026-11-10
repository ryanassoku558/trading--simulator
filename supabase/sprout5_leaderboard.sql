-- Sprout 5: opt-in public XP leaderboard. Run in Supabase SQL Editor before enabling.
-- Public entries expose a chosen display name and XP only, never email or trade history.
create table if not exists public.leaderboard_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 3 and 24 and display_name ~ '^[A-Za-z0-9_ ]+$'),
 opted_in boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.leaderboard_profiles enable row level security;
revoke all on public.leaderboard_profiles from anon;
grant select,insert,update,delete on public.leaderboard_profiles to authenticated;
drop policy if exists "Own leaderboard profile" on public.leaderboard_profiles;
create policy "Own leaderboard profile" on public.leaderboard_profiles for all to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
-- SECURITY DEFINER only returns opted-in name and verified XP from existing learning_progress.
-- XP is read from learning_progress; because that JSON is client-writable, rankings are not cheat-resistant.
create or replace function public.sprout_leaderboard()
returns table(display_name text,xp integer)
language sql security definer stable set search_path = ''
as $$
 select p.display_name,case when (l.progress->>'xp') ~ '^[0-9]{1,6}
 from public.leaderboard_profiles p
 join public.learning_progress l on l.user_id=p.user_id
 where p.opted_in=true and (l.progress->>'xp') ~ '^[0-9]{1,6}$'
 order by xp desc,p.updated_at asc limit 25
$$;
revoke all on function public.sprout_leaderboard() from public,anon;
grant execute on function public.sprout_leaderboard() to authenticated;
 then least(100000,(l.progress->>'xp')::integer) else 0 end as xp
 from public.leaderboard_profiles p
 join public.learning_progress l on l.user_id=p.user_id
 where p.opted_in=true and (l.progress->>'xp') ~ '^[0-9]{1,6}$'
 order by xp desc,p.updated_at asc limit 25
$$;
revoke all on function public.sprout_leaderboard() from public,anon;
grant execute on function public.sprout_leaderboard() to authenticated;
