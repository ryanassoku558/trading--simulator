-- Enable user-requested permanent account deletion. Safe to rerun.
begin;
create or replace function public.sprout_delete_account(confirmation text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare caller uuid := auth.uid();
begin
 if caller is null then raise exception 'Sign in before deleting an account.' using errcode='42501'; end if;
 if confirmation is distinct from 'DELETE' then raise exception 'Deletion confirmation required.' using errcode='22023'; end if;
 -- No user ID parameter: callers can delete only their own account.
 delete from auth.users where id = caller;
 if not found then raise exception 'Account not found.'; end if;
end;
$$;
revoke all on function public.sprout_delete_account(text) from public, anon;
grant execute on function public.sprout_delete_account(text) to authenticated;
commit;
