-- Opt-in rankings expose only a chosen nickname and self-reported learning XP.
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

-- The privileged aggregate stays in an unexposed schema; no per-user JSON is returned.
create schema if not exists sprout_private;
revoke all on schema sprout_private from public,anon;
grant usage on schema sprout_private to authenticated;
create or replace function sprout_private.leaderboard_rows()
returns table(display_name text,xp integer)
language plpgsql security definer stable set search_path = ''
as $$
begin
 if (select auth.uid()) is null then
  raise exception 'Sign in to view community rankings' using errcode='42501';
 end if;
 return query
 select p.display_name,
  case when (l.progress->>'xp') ~ '^[0-9]{1,6}$'
   then least(100000,(l.progress->>'xp')::integer) else 0 end as xp
 from public.leaderboard_profiles p
 join public.learning_progress l on l.user_id=p.user_id
 where p.opted_in=true
 order by 2 desc,p.updated_at asc limit 25;
end;
$$;
revoke all on function sprout_private.leaderboard_rows() from public,anon;
grant execute on function sprout_private.leaderboard_rows() to authenticated;

create or replace function public.sprout_leaderboard()
returns table(display_name text,xp integer)
language sql security invoker stable set search_path = ''
as $$ select * from sprout_private.leaderboard_rows() $$;
revoke all on function public.sprout_leaderboard() from public,anon;
grant execute on function public.sprout_leaderboard() to authenticated;
notify pgrst, 'reload schema';