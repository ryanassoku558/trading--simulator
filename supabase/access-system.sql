-- Sprout access system: run this complete file in Supabase SQL Editor.
-- Requires existing schema.sql and referrals.sql. Does not enable or collect payments.

-- Sprout Pro: trusted entitlements and atomic virtual-money actions.
-- Apply once billing is ready. Safe to rerun. Never put service-role credentials in the browser.
begin;
create table if not exists public.sprout_subscriptions (
 user_id uuid primary key references auth.users(id) on delete cascade,
 provider text not null default 'stripe', customer_id text unique,
 subscription_id text unique, checkout_session_id text, status text not null default 'inactive',
 expires_at timestamptz, cancel_at_period_end boolean not null default false
);
alter table public.sprout_subscriptions enable row level security;
drop policy if exists "Read own subscription" on public.sprout_subscriptions;
create policy "Read own subscription" on public.sprout_subscriptions for select to authenticated using(auth.uid()=user_id);
revoke all on public.sprout_subscriptions from anon,authenticated;
grant select on public.sprout_subscriptions to authenticated;
grant all on public.sprout_subscriptions to service_role;
create table if not exists public.sprout_simulator_actions (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 action text not null check(action in ('reset','recharge')), amount numeric not null,
 created_at timestamptz not null default now()
);
alter table public.sprout_simulator_actions enable row level security;
revoke all on public.sprout_simulator_actions from anon,authenticated;
grant all on public.sprout_simulator_actions to service_role;
grant usage,select on sequence public.sprout_simulator_actions_id_seq to service_role;
create or replace function public.sprout_simulator_action(account_user uuid,requested_action text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare saved jsonb; balance numeric; stamp timestamptz;
begin
 if not exists(select 1 from public.sprout_subscriptions where user_id=account_user and status='active' and expires_at>now()) then raise exception 'Sprout Pro is required.'; end if;
 select account into saved from public.paper_accounts where user_id=account_user for update;
 if saved is null then raise exception 'Practice account not found.'; end if;
 if requested_action='reset' then
  saved:=saved||jsonb_build_object('cash',10000,'holdings','[]'::jsonb,'trades','[]'::jsonb,'orders','[]'::jsonb,'journal','[]'::jsonb,'moods','[]'::jsonb,'referralDeposits',0,'simulatorDeposits',0,'snapshots',jsonb_build_array(jsonb_build_object('date','Start','value',10000)));
  saved:=saved-'challenge'-'returnGoal';
  insert into public.sprout_simulator_actions(user_id,action,amount)values(account_user,'reset',10000);
 elsif requested_action='recharge' then
  balance:=(saved->>'cash')::numeric;
  if balance<0 or balance>0.005 or jsonb_array_length(saved->'holdings')<>0 or exists(select 1 from jsonb_array_elements(saved->'orders')o where o->>'status'='pending')then raise exception 'Recharge requires a depleted account with no holdings or pending orders.';end if;
  saved:=saved||jsonb_build_object('cash',balance+5000,'simulatorDeposits',coalesce((saved->>'simulatorDeposits')::numeric,0)+5000);
  saved:=saved-'returnGoal'-'challenge';
  saved:=jsonb_set(saved,'{snapshots}',coalesce(saved->'snapshots','[]'::jsonb)||jsonb_build_array(jsonb_build_object('date','Recharge','value',balance+5000)));
  insert into public.sprout_simulator_actions(user_id,action,amount)values(account_user,'recharge',5000);
 else raise exception 'Unknown simulator action.';end if;
 select greatest(clock_timestamp(),updated_at+interval '1 microsecond')into stamp from public.paper_accounts where user_id=account_user;
 update public.paper_accounts set account=saved,updated_at=stamp where user_id=account_user;
 return saved;
end $$;
revoke all on function public.sprout_simulator_action(uuid,text) from public,anon,authenticated;
grant execute on function public.sprout_simulator_action(uuid,text) to service_role;
create table if not exists public.sprout_support_requests (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 message text not null check(length(message) between 10 and 2000),
 created_at timestamptz not null default now(), status text not null default 'open'
);
alter table public.sprout_support_requests enable row level security;
revoke all on public.sprout_support_requests from anon,authenticated;
grant all on public.sprout_support_requests to service_role;
grant usage,select on sequence public.sprout_support_requests_id_seq to service_role;
-- Direct browser saves cannot reset trade history or award practice deposits.
create or replace function public.sprout_guard_account_actions()returns trigger
language plpgsql set search_path='' as $$
begin
 if auth.role()='authenticated' and coalesce(current_setting('sprout.authorized_referral',true),'off')<>'on' then
  if coalesce(new.account->'simulatorDeposits','0'::jsonb)<>coalesce(old.account->'simulatorDeposits','0'::jsonb) or coalesce(new.account->'referralDeposits','0'::jsonb)<>coalesce(old.account->'referralDeposits','0'::jsonb)then raise exception 'Practice deposits must use an authorized account action.';end if;
  if exists(select 1 from jsonb_array_elements(old.account->'trades')previous where not exists(select 1 from jsonb_array_elements(new.account->'trades')current where current->>'id'=previous->>'id')) then raise exception 'Simulator resets require Sprout Pro.';end if;
  if (new.account->>'cash')::numeric<>(old.account->>'cash')::numeric and jsonb_array_length(new.account->'trades')=jsonb_array_length(old.account->'trades') then raise exception 'Cash changes require a trade or authorized account action.';end if;
 end if;return new;
end$$;
drop trigger if exists sprout_guard_account_actions on public.paper_accounts;
create trigger sprout_guard_account_actions before update on public.paper_accounts for each row execute function public.sprout_guard_account_actions();
create or replace function public.sprout_delete_account(confirmation text)returns void
language plpgsql security definer set search_path='' as $$
declare caller uuid:=auth.uid();begin
 if caller is null then raise exception 'Sign in before deleting your account.';end if;
 if confirmation is distinct from 'DELETE'then raise exception 'Deletion confirmation required.';end if;
 if exists(select 1 from public.sprout_subscriptions where user_id=caller and customer_id is not null)then raise exception 'Use secure deletion for your linked billing account.';end if;
 delete from auth.users where id=caller;
 if not found then raise exception 'Account not found.';end if;
end$$;
revoke all on function public.sprout_delete_account(text)from public,anon;
grant execute on function public.sprout_delete_account(text)to authenticated;
create or replace function public.sprout_guard_pro_community()returns trigger
language plpgsql security definer set search_path='' as $$
declare premium boolean:=false;begin
 if auth.role()='authenticated'then
  if tg_table_name='community_scores'then premium:=true;else premium:=new.kind='chart';end if;
  if premium and not exists(select 1 from public.sprout_subscriptions where user_id=auth.uid()and status='active'and expires_at>now())then raise exception 'Community challenges require Sprout Pro.';end if;
 end if;return new;
end$$;
do $$begin
 if to_regclass('public.community_scores')is not null then
  execute 'drop trigger if exists sprout_pro_scores on public.community_scores';
  execute 'create trigger sprout_pro_scores before insert or update on public.community_scores for each row execute function public.sprout_guard_pro_community()';
 end if;
 if to_regclass('public.community_posts')is not null then
  execute 'drop trigger if exists sprout_pro_charts on public.community_posts';
  execute 'create trigger sprout_pro_charts before insert or update on public.community_posts for each row execute function public.sprout_guard_pro_community()';
 end if;
end$$;
commit;

-- Personal signup codes. Run after referrals.sql and subscriptions.sql.
-- Existing rewards are preserved. New $5,000 rewards go to the referred learner.
begin;
alter table public.referral_rewards drop constraint if exists referral_rewards_amount_check;
alter table public.referral_rewards add constraint referral_rewards_amount_check check(amount in (5000,10000));
alter table public.referral_rewards alter column amount set default 5000;
create or replace function public.sprout_validate_referral(input_code text)returns boolean
language sql stable security definer set search_path='' as $$select exists(select 1 from public.referral_codes where code=upper(trim(input_code)))$$;
create or replace function public.sprout_customize_referral(input_code text)returns text
language plpgsql security definer set search_path='' as $$
declare caller uuid:=auth.uid(); cleaned text:=upper(trim(input_code));
begin
 if caller is null then raise exception 'Sign in first.';end if;
 if cleaned!~'^[A-Z0-9_]{3,24}$'then raise exception 'Use 3–24 letters, numbers or underscores.';end if;
 if not exists(select 1 from public.paper_accounts where user_id=caller)then raise exception 'Create your practice account first.';end if;
 insert into public.referral_codes(user_id,code)values(caller,cleaned)on conflict(user_id)do update set code=excluded.code;
 return cleaned;
exception when unique_violation then raise exception 'That code is already taken. Try another.';
end$$;
create or replace function public.sprout_referral_status()returns jsonb
language plpgsql security definer set search_path='' as $$
declare caller uuid:=auth.uid(); owncode text; friends integer;
begin
 if caller is null then raise exception 'Sign in first.';end if;
 insert into public.referral_codes(user_id)values(caller)on conflict(user_id)do nothing;
 select code into owncode from public.referral_codes where user_id=caller;
 select count(*)into friends from public.referral_rewards where referrer_id=caller;
 return jsonb_build_object('version',2,'code',owncode,'friends',friends,'redeemed',exists(select 1 from public.referral_rewards where referred_id=caller));
end$$;
create or replace function public.sprout_apply_signup_referral()returns jsonb
language plpgsql security definer set search_path='' as $$
declare caller uuid:=auth.uid(); owner uuid; inputcode text; saved jsonb; stamp timestamptz;
begin
 if caller is null then raise exception 'Sign in first.';end if;
 select upper(trim(raw_user_meta_data->>'referral_code'))into inputcode from auth.users where id=caller and email_confirmed_at is not null and created_at>=now()-interval '7 days';
 if inputcode is null or inputcode=''then return jsonb_build_object('awarded',0);end if;
 select user_id into owner from public.referral_codes where code=inputcode;
 if owner is null or owner=caller then return jsonb_build_object('awarded',0);end if;
 select account into saved from public.paper_accounts where user_id=caller for update;
 if saved is null or exists(select 1 from public.referral_rewards where referred_id=caller)then return jsonb_build_object('awarded',0);end if;
 insert into public.referral_rewards(referred_id,referrer_id,amount)values(caller,owner,5000);
 saved:=saved||jsonb_build_object('cash',(saved->>'cash')::numeric+5000,'referralDeposits',coalesce((saved->>'referralDeposits')::numeric,0)+5000);
 saved:=saved-'returnGoal'-'challenge';
 saved:=jsonb_set(saved,'{snapshots}',coalesce(saved->'snapshots','[]'::jsonb)||jsonb_build_array(jsonb_build_object('date','Signup bonus','value',(saved->>'cash')::numeric)));
 select greatest(clock_timestamp(),updated_at+interval '1 microsecond')into stamp from public.paper_accounts where user_id=caller;
 perform set_config('sprout.authorized_referral','on',true);
 update public.paper_accounts set account=saved,updated_at=stamp where user_id=caller;
 perform set_config('sprout.authorized_referral','off',true);
 return jsonb_build_object('awarded',5000);
end$$;
-- Disable the previous redeem-later promotion: signup codes are the only new reward path.
revoke all on function public.sprout_redeem_referral(text)from public,anon,authenticated;
revoke all on function public.sprout_customize_referral(text),public.sprout_apply_signup_referral(),public.sprout_referral_status(),public.sprout_validate_referral(text)from public,anon,authenticated;
grant execute on function public.sprout_validate_referral(text)to anon,authenticated;
grant execute on function public.sprout_customize_referral(text),public.sprout_apply_signup_referral(),public.sprout_referral_status()to authenticated;
commit;
