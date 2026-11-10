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
