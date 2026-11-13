-- Live rooms are accessed only through authenticated server code, never the browser Data API.
create schema if not exists sprout_live;
revoke all on schema sprout_live from public,anon,authenticated;
grant usage on schema sprout_live to service_role;
create table sprout_live.rooms (
 id uuid primary key default gen_random_uuid(),
 code text unique not null check(code ~ '^[A-HJ-NP-Z2-9]{6}$'),
 host_id uuid not null references auth.users(id) on delete cascade,
 title text not null,
 questions jsonb not null check(jsonb_typeof(questions)='array' and jsonb_array_length(questions)>0),
 phase text not null default 'waiting' check(phase in ('waiting','question','reveal','finished')),
 question_index integer not null default 0 check(question_index>=0),
 seconds integer not null default 45 check(seconds in (5,10,15,20,30,45,60,90,120,240)),
 ends_at timestamptz,
 expires_at timestamptz not null default now()+interval '2 hours',
 created_at timestamptz not null default now()
);
create index on sprout_live.rooms(host_id,expires_at);
create table sprout_live.players (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references sprout_live.rooms(id) on delete cascade,
 token_hash text not null,
 nickname text not null check(nickname ~ '^[A-Za-z0-9_ ]{2,20}$'),
 score integer not null default 0,
 unique(room_id,token_hash)
);
create unique index live_unique_nickname on sprout_live.players(room_id,lower(nickname));
create table sprout_live.answers (
 room_id uuid not null references sprout_live.rooms(id) on delete cascade,
 player_id uuid not null references sprout_live.players(id) on delete cascade,
 question_index integer not null,
 choice integer not null,
 correct boolean not null,
 points integer not null,
 primary key(room_id,player_id,question_index)
);
alter table sprout_live.rooms enable row level security;
alter table sprout_live.players enable row level security;
alter table sprout_live.answers enable row level security;
revoke all on all tables in schema sprout_live from public,anon,authenticated;
grant select,insert,update,delete on all tables in schema sprout_live to service_role;

create or replace function public.sprout_live_create(p_host uuid,p_code text,p_title text,p_questions jsonb,p_seconds integer)
returns text language plpgsql security invoker set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtext(p_host::text));
 if (select count(*) from sprout_live.rooms where host_id=p_host and created_at>now()-interval '1 hour')>=10 then raise exception 'You’ve hosted ten games this hour. Please try again later.'; end if;
 if (select count(*) from sprout_live.rooms where host_id=p_host and expires_at>now() and phase<>'finished')>=3 then
  raise exception 'You already have three active rooms. Finish one before hosting another.';
 end if;
 -- Remove only expired room records; player and answer records cascade with them.
 delete from sprout_live.rooms where host_id=p_host and expires_at<now();
 insert into sprout_live.rooms(host_id,code,title,questions,seconds) values(p_host,p_code,p_title,p_questions,p_seconds);
 return p_code;
end $$;

create or replace function public.sprout_live_action(p_code text,p_token text,p_host uuid,p_action text,p_index integer default 0,p_choice integer default null,p_nickname text default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare r sprout_live.rooms; p sprout_live.players; q jsonb; pts integer; right_answer boolean;
begin
 select * into r from sprout_live.rooms where code=p_code and expires_at>now() for update;
 if not found then raise exception 'Room not found or expired.' using errcode='P0002'; end if;
 if p_action='join' then
  select * into p from sprout_live.players where room_id=r.id and token_hash=p_token;
  if found then return jsonb_build_object('ok',true); end if;
  if r.phase<>'waiting' then raise exception 'This game has started. Ask the host for the next room.'; end if;
  if p_token is null or length(p_token)<>64 then raise exception 'Invalid player session.'; end if;
  if (select count(*) from sprout_live.players where room_id=r.id)>=50 then raise exception 'This room is full (50 players).'; end if;
  if p_nickname is null or p_nickname !~ '^[A-Za-z0-9_ ]{2,20}$' then raise exception 'Use 2–20 letters, numbers, spaces or underscores for your nickname.'; end if;
  insert into sprout_live.players(room_id,token_hash,nickname) values(r.id,p_token,trim(p_nickname));
  return jsonb_build_object('ok',true);
 end if;
 if p_action='answer' then
  select * into p from sprout_live.players where room_id=r.id and token_hash=p_token;
  if not found then raise exception 'Join the room first.' using errcode='42501'; end if;
  if r.phase<>'question' or r.ends_at<=now() or p_index<>r.question_index then raise exception 'That question has closed. Wait for the next question.'; end if;
  q=r.questions->r.question_index;
  if p_choice is null or p_choice<0 or p_choice>=jsonb_array_length(q->'options') then raise exception 'Choose one of the answers.'; end if;
  if exists(select 1 from sprout_live.answers where room_id=r.id and player_id=p.id and question_index=r.question_index) then return jsonb_build_object('ok',true); end if;
  right_answer=p_choice=(q->>'answer')::integer;
  pts=case when right_answer then 1000+greatest(0,least(200,floor(200*extract(epoch from (r.ends_at-now()))/r.seconds)::integer)) else 0 end;
  insert into sprout_live.answers values(r.id,p.id,r.question_index,p_choice,right_answer,pts);
  update sprout_live.players set score=score+pts where id=p.id;
  -- Correctness and points are intentionally withheld until reveal.
  return jsonb_build_object('ok',true);
 end if;
 if p_host is null or p_host<>r.host_id then raise exception 'Only this room’s host can control the game.' using errcode='42501'; end if;
 if p_action='end' then update sprout_live.rooms set phase='finished' where id=r.id;
 elsif p_action='start' and r.phase='waiting' then
  if not exists(select 1 from sprout_live.players where room_id=r.id) then raise exception 'Wait for at least one player to join.'; end if;
  update sprout_live.rooms set phase='question',ends_at=now()+make_interval(secs=>r.seconds) where id=r.id;
 elsif p_action='reveal' and r.phase='question' and p_index=r.question_index then
  update sprout_live.rooms set phase='reveal' where id=r.id;
 elsif p_action='next' and p_index=r.question_index and (r.phase='reveal' or (r.phase='question' and r.ends_at<=now())) then
  if r.question_index=jsonb_array_length(r.questions)-1 then update sprout_live.rooms set phase='finished' where id=r.id;
  else update sprout_live.rooms set phase='question',question_index=question_index+1,ends_at=now()+make_interval(secs=>r.seconds) where id=r.id; end if;
 else raise exception 'The room has already moved on. Refresh the game.'; end if;
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.sprout_live_snapshot(p_code text,p_token text,p_host uuid)
returns jsonb language plpgsql security invoker stable set search_path='' as $$
declare r sprout_live.rooms; p sprout_live.players; a sprout_live.answers; phase_now text; q jsonb; board jsonb; is_host boolean;
begin
 select * into r from sprout_live.rooms where code=p_code and expires_at>now();
 if not found then raise exception 'Room not found or expired.' using errcode='P0002'; end if;
 is_host=p_host is not null and p_host=r.host_id;
 select * into p from sprout_live.players where room_id=r.id and token_hash=p_token;
 if not is_host and p.id is null then raise exception 'Enter your nickname to join this room.' using errcode='42501'; end if;
 phase_now=case when r.phase='question' and r.ends_at<=now() then 'reveal' else r.phase end;
 q=r.questions->r.question_index;
 select coalesce(jsonb_agg(row_data order by (row_data->>'score')::integer desc,row_data->>'nickname'),'[]'::jsonb) into board from (
  select jsonb_build_object('nickname',lp.nickname,'score',lp.score-case when phase_now='question' then coalesce(la.points,0) else 0 end,'answered',la.player_id is not null) row_data
  from sprout_live.players lp left join sprout_live.answers la on la.player_id=lp.id and la.room_id=r.id and la.question_index=r.question_index where lp.room_id=r.id
 ) x;
 select * into a from sprout_live.answers where room_id=r.id and player_id=p.id and question_index=r.question_index;
 return jsonb_build_object('code',r.code,'title',r.title,'phase',phase_now,'isHost',is_host,'index',r.question_index,'total',jsonb_array_length(r.questions),'seconds',r.seconds,'endsAt',r.ends_at,'serverNow',now(),'players',board,'presentation',r.questions->0->'presentation',
  'answerDistribution',case when phase_now='reveal' then (select coalesce(jsonb_object_agg(choice,n),'{}'::jsonb) from (select choice,count(*) n from sprout_live.answers where room_id=r.id and question_index=r.question_index group by choice) c) else null end,
  'answeredCount',(select count(*) from sprout_live.answers where room_id=r.id and question_index=r.question_index),
  'question',case when phase_now in ('question','reveal') then jsonb_build_object('text',q->>'question','options',q->'options') || case when phase_now='reveal' then jsonb_build_object('answer',q->'answer','explanation',q->>'explanation') else '{}'::jsonb end else null end,
  'self',case when p.id is null then null else jsonb_build_object('nickname',p.nickname,'submitted',a.player_id is not null,'choice',a.choice) || case when phase_now in ('reveal','finished') then jsonb_build_object('correct',a.correct,'points',a.points) else '{}'::jsonb end end);
end $$;
revoke all on function public.sprout_live_create(uuid,text,text,jsonb,integer) from public,anon,authenticated;
revoke all on function public.sprout_live_action(text,text,uuid,text,integer,integer,text) from public,anon,authenticated;
revoke all on function public.sprout_live_snapshot(text,text,uuid) from public,anon,authenticated;
grant execute on function public.sprout_live_create(uuid,text,text,jsonb,integer) to service_role;
grant execute on function public.sprout_live_action(text,text,uuid,text,integer,integer,text) to service_role;
grant execute on function public.sprout_live_snapshot(text,text,uuid) to service_role;
notify pgrst,'reload schema';
