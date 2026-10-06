-- Sprout referral rewards: virtual simulation cash only. Safe to rerun.
-- Run AFTER the account setup migration in the Supabase SQL Editor.
begin;
create table if not exists public.referral_codes (
 user_id uuid primary key references auth.users(id) on delete cascade,
 code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
 created_at timestamptz not null default now()
);
create table if not exists public.referral_rewards (
 id uuid primary key default gen_random_uuid(),
 referred_id uuid unique references auth.users(id) on delete set null,
 referrer_id uuid not null references auth.users(id) on delete cascade,
 amount integer not null default 10000 check (amount=10000),
 created_at timestamptz not null default now(),
 check (referred_id<>referrer_id)
);
alter table public.referral_codes enable row level security;
alter table public.referral_rewards enable row level security;
revoke all on public.referral_codes,public.referral_rewards from anon,authenticated;
-- All operations go through these authenticated functions; clients cannot insert rewards.
create or replace function public.sprout_referral_status() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); owncode text; friends integer; used boolean;
begin
 if caller is null then raise exception 'Sign in first.'; end if;
 if not exists (select 1 from public.paper_accounts where user_id=caller) then raise exception 'Create your practice account first.'; end if;
 insert into public.referral_codes(user_id) values(caller) on conflict(user_id) do nothing;
 select code into owncode from public.referral_codes where user_id=caller;
 select count(*) into friends from public.referral_rewards where referrer_id=caller;
 select exists(select 1 from public.referral_rewards where referred_id=caller) into used;
 return jsonb_build_object('code',owncode,'friends',friends,'bonus',friends*10000,'redeemed',used);
end $$;
create or replace function public.sprout_redeem_referral(input_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); owner uuid; owneraccount jsonb; stamp timestamptz;
begin
 if caller is null then raise exception 'Sign in first.'; end if;
 if not exists(select 1 from auth.users where id=caller and email_confirmed_at is not null) then raise exception 'Confirm your email before redeeming a code.'; end if;
 if not exists(select 1 from auth.users where id=caller and created_at>=now()-interval '7 days') then raise exception 'Codes can be redeemed within seven days of account creation.'; end if;
 select user_id into owner from public.referral_codes where code=upper(trim(input_code));
 if owner is null then raise exception 'That referral code was not found.'; end if;
 if owner=caller then raise exception 'You cannot redeem your own code.'; end if;
 -- Lock both accounts in a stable order to prevent concurrent award loss/deadlocks.
 perform user_id from public.paper_accounts where user_id in (caller,owner) order by user_id for update;
 if not exists(select 1 from public.paper_accounts where user_id=caller) then raise exception 'Create your practice account first.'; end if;
 select account into owneraccount from public.paper_accounts where user_id=owner;
 if owneraccount is null then raise exception 'The referring account is unavailable.'; end if;
 if exists(select 1 from public.referral_rewards where referred_id=caller) then raise exception 'You have already redeemed a referral code.'; end if;
 insert into public.referral_rewards(referred_id,referrer_id) values(caller,owner);
 owneraccount := jsonb_set(owneraccount,'{cash}',to_jsonb((owneraccount->>'cash')::numeric+10000));
 owneraccount := jsonb_set(owneraccount,'{referralDeposits}',to_jsonb(coalesce((owneraccount->>'referralDeposits')::numeric,0)+10000));
 -- End the optional return goal: deposits should never count as trading profits.
 owneraccount := owneraccount-'returnGoal';
 select greatest(clock_timestamp(),updated_at+interval '1 microsecond') into stamp from public.paper_accounts where user_id=owner;
 update public.paper_accounts set account=owneraccount,updated_at=stamp where user_id=owner;
 return jsonb_build_object('awarded',10000);
end $$;
revoke all on function public.sprout_referral_status() from public,anon;
revoke all on function public.sprout_redeem_referral(text) from public,anon;
grant execute on function public.sprout_referral_status() to authenticated;
grant execute on function public.sprout_redeem_referral(text) to authenticated;
commit;
