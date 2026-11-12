create schema if not exists sprout_classroom;
revoke all on schema sprout_classroom from public,anon,authenticated;
grant usage on schema sprout_classroom to service_role;
create table sprout_classroom.classes(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id) on delete cascade,
 code text not null unique check(code ~ '^[A-HJ-NP-Z2-9]{8}$'),name text not null check(length(name) between 2 and 80),teacher_name text not null check(length(teacher_name) between 2 and 60),archived boolean not null default false,created_at timestamptz not null default now()
);
create index on sprout_classroom.classes(owner_id);
create table sprout_classroom.members(
 class_id uuid not null references sprout_classroom.classes(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,
 display_name text not null check(length(display_name) between 2 and 60),joined_at timestamptz not null default now(),primary key(class_id,user_id)
);
create index on sprout_classroom.members(user_id);
create table sprout_classroom.assignments(
 id uuid primary key default gen_random_uuid(),class_id uuid not null references sprout_classroom.classes(id) on delete cascade,title text not null check(length(title) between 2 and 120),instructions text not null default '' check(length(instructions)<=2000),
 lesson_ids integer[] not null check(cardinality(lesson_ids) between 1 and 159),mission text not null check(mission in ('risk_plan','comparison','trade_reflection')),due_at timestamptz not null,closed boolean not null default false,created_at timestamptz not null default now(),unique(id,class_id)
);
create index on sprout_classroom.assignments(class_id,due_at);
create table sprout_classroom.progress(
 assignment_id uuid not null,class_id uuid not null,user_id uuid not null,lessons_completed integer[] not null default '{}',quiz_best integer check(quiz_best between 0 and 100),quiz_latest integer check(quiz_latest between 0 and 100),quiz_attempts integer not null default 0,weak_ids integer[] not null default '{}',
 mission_data jsonb,mission_status text not null default 'not_started' check(mission_status in ('not_started','submitted','revision','approved')),mission_version integer not null default 0,submitted_at timestamptz,feedback text check(length(feedback)<=2000),rubric jsonb,reviewed_at timestamptz,completed_at timestamptz,updated_at timestamptz not null default now(),
 primary key(assignment_id,user_id),foreign key(assignment_id,class_id) references sprout_classroom.assignments(id,class_id) on delete cascade,foreign key(class_id,user_id) references sprout_classroom.members(class_id,user_id) on delete cascade
);
create index on sprout_classroom.progress(user_id);
create index on sprout_classroom.progress(class_id,user_id);
create index on sprout_classroom.progress(assignment_id,class_id);
create table sprout_classroom.checks(
 id uuid primary key default gen_random_uuid(),assignment_id uuid not null,class_id uuid not null,user_id uuid not null,
 kind text not null check(kind in ('check','review')),questions jsonb not null check(jsonb_typeof(questions)='array' and jsonb_array_length(questions)=5),answers jsonb not null default '[]',question_index integer not null default 0 check(question_index between 0 and 5),status text not null default 'active' check(status in ('active','complete','abandoned')),score integer check(score between 0 and 100),created_at timestamptz not null default now(),completed_at timestamptz,
 foreign key(assignment_id,user_id) references sprout_classroom.progress(assignment_id,user_id) on delete cascade
);
create index on sprout_classroom.checks(assignment_id,user_id,completed_at);
create index on sprout_classroom.checks(user_id);
create unique index on sprout_classroom.checks(assignment_id,user_id,kind) where status='active';
alter table sprout_classroom.classes enable row level security;
alter table sprout_classroom.members enable row level security;
alter table sprout_classroom.assignments enable row level security;
alter table sprout_classroom.progress enable row level security;
alter table sprout_classroom.checks enable row level security;
revoke all on all tables in schema sprout_classroom from public,anon,authenticated;
grant select,insert,update,delete on all tables in schema sprout_classroom to service_role;

create or replace function sprout_classroom.sync(p_actor uuid) returns void language plpgsql security invoker set search_path='' as $$
declare completed jsonb;
begin
 select account->'learning'->'completed' into completed from public.paper_accounts where user_id=p_actor;
 completed=case when jsonb_typeof(completed)='array' then completed else '[]'::jsonb end;
 update sprout_classroom.progress p set lessons_completed=coalesce((select array_agg(id) from unnest(a.lesson_ids) id where completed @> to_jsonb(array[id])),'{}'),updated_at=now()
 from sprout_classroom.assignments a where a.id=p.assignment_id and p.user_id=p_actor and p.completed_at is null and not a.closed and exists(select 1 from sprout_classroom.classes cl where cl.id=a.class_id and not cl.archived) and p.lessons_completed is distinct from coalesce((select array_agg(id) from unnest(a.lesson_ids) id where completed @> to_jsonb(array[id])),'{}'::integer[]);
 update sprout_classroom.progress p set completed_at=now(),updated_at=now() from sprout_classroom.assignments a where a.id=p.assignment_id and p.user_id=p_actor and p.completed_at is null and not a.closed and exists(select 1 from sprout_classroom.classes cl where cl.id=a.class_id and not cl.archived) and p.quiz_best>=80 and cardinality(p.weak_ids)=0 and p.mission_status='approved' and p.lessons_completed @> a.lesson_ids;
end $$;

create or replace function sprout_classroom.mastery(p_actor uuid,p_assignment uuid default null) returns jsonb language sql security invoker stable set search_path='' as $$
 with checks as (
 select s.id,s.completed_at,(v->>'lessonId')::integer lesson_id,bool_and((v->>'correct')::boolean) correct
 from sprout_classroom.checks s cross join lateral jsonb_array_elements(s.answers) v where s.user_id=p_actor and s.status='complete' and (p_assignment is null or s.assignment_id=p_assignment) group by s.id,s.completed_at,(v->>'lessonId')::integer
 ), ranked as (select *,row_number() over(partition by lesson_id order by completed_at desc,id) rn from checks), grouped as (
 select lesson_id,count(*) attempts,count(*) filter(where correct) correct_count,(array_agg(correct order by rn))[1] latest,bool_and(correct) filter(where rn<=2) recent,max(completed_at) last_at from ranked group by lesson_id)
 select coalesce(jsonb_agg(jsonb_build_object('lessonId',lesson_id,'attempts',attempts,'correct',correct_count,'status',case when not latest then 'needs_review' when attempts>=2 and recent then 'secure' else 'developing' end,'lastAt',last_at) order by last_at desc),'[]'::jsonb) from grouped;
$$;

create or replace function sprout_classroom.public_check(p_check uuid,p_actor uuid) returns jsonb language plpgsql security invoker stable set search_path='' as $$
declare s sprout_classroom.checks; q jsonb;
begin
 select * into s from sprout_classroom.checks where id=p_check and user_id=p_actor;
 if not found then raise exception 'Check not found.' using errcode='P0002'; end if;
 q=s.questions->s.question_index;
 return jsonb_build_object('id',s.id,'assignmentId',s.assignment_id,'kind',s.kind,'index',s.question_index,'total',5,'status',s.status,'score',s.score,
 'question',case when s.status='active' then jsonb_build_object('text',q->>'question','options',q->'options','lessonId',q->'lessonId') else null end,
 'results',case when s.status='complete' then (select jsonb_agg(jsonb_build_object('lessonId',v->'lessonId','correct',v->'correct','question',s.questions->(ord-1)::int->>'question','explanation',s.questions->(ord-1)::int->>'explanation')) from jsonb_array_elements(s.answers) with ordinality as t(v,ord)) else null end);
end $$;

create or replace function public.sprout_classroom_action(p_actor uuid,p_action text,p_data jsonb default '{}') returns jsonb language plpgsql security invoker set search_path='' as $$
declare c sprout_classroom.classes; a sprout_classroom.assignments; p sprout_classroom.progress; s sprout_classroom.checks; q jsonb; v jsonb; ids integer[]; bad integer[]; good integer[]; score_now integer; idx integer; choice integer; right_answer boolean; actor_account jsonb;
begin
 if p_actor is null then raise exception 'Sign in to use classrooms.' using errcode='42501'; end if;
 if p_action='create' then
  perform pg_advisory_xact_lock(hashtext(p_actor::text));
  if (select count(*) from sprout_classroom.classes where owner_id=p_actor and created_at>now()-interval '1 hour')>=10 then raise exception 'Please wait before creating another class.'; end if;
  insert into sprout_classroom.classes(owner_id,code,name,teacher_name) values(p_actor,p_data->>'code',trim(p_data->>'name'),trim(p_data->>'teacherName')) returning * into c;
  return jsonb_build_object('classId',c.id,'code',c.code);
 end if;
 if p_action in ('lookup','join') then
  select * into c from sprout_classroom.classes where code=p_data->>'code' and not archived for update;
  if not found then raise exception 'Class code not found or enrollment is closed.' using errcode='P0002'; end if;
  if p_action='lookup' then return jsonb_build_object('id',c.id,'name',c.name,'teacherName',c.teacher_name); end if;
  if c.owner_id=p_actor then raise exception 'You already teach this class. Share its code with your learners.'; end if;
  insert into sprout_classroom.members(class_id,user_id,display_name) values(c.id,p_actor,trim(p_data->>'displayName')) on conflict(class_id,user_id) do nothing;
  insert into sprout_classroom.progress(assignment_id,class_id,user_id) select id,c.id,p_actor from sprout_classroom.assignments where class_id=c.id on conflict do nothing;
  perform sprout_classroom.sync(p_actor);
  return jsonb_build_object('classId',c.id);
 end if;
 if p_action='sync' then perform sprout_classroom.sync(p_actor); return jsonb_build_object('ok',true); end if;
 if p_action in ('assign','archive','rotate','leave') then
  select * into c from sprout_classroom.classes where id=(p_data->>'classId')::uuid for update;
  if not found then raise exception 'Class not found.' using errcode='P0002'; end if;
  if p_action='leave' then delete from sprout_classroom.members where class_id=c.id and user_id=p_actor;return jsonb_build_object('ok',true);end if;
  if c.owner_id<>p_actor then raise exception 'Only this class teacher can do that.' using errcode='42501';end if;
  if p_action='archive' then update sprout_classroom.classes set archived=(p_data->>'archived')::boolean where id=c.id;return jsonb_build_object('ok',true);end if;
  if p_action='rotate' then update sprout_classroom.classes set code=p_data->>'code' where id=c.id;return jsonb_build_object('code',p_data->>'code');end if;
  if c.archived then raise exception 'Reopen the class before assigning new work.';end if;
  select array_agg(value::int) into ids from jsonb_array_elements_text(p_data->'lessonIds');
  insert into sprout_classroom.assignments(class_id,title,instructions,lesson_ids,mission,due_at) values(c.id,trim(p_data->>'title'),coalesce(p_data->>'instructions',''),ids,p_data->>'mission',(p_data->>'dueAt')::timestamptz) returning * into a;
  insert into sprout_classroom.progress(assignment_id,class_id,user_id) select a.id,c.id,user_id from sprout_classroom.members where class_id=c.id;
  return jsonb_build_object('assignmentId',a.id);
 end if;
 if p_action='answer' then
  select * into s from sprout_classroom.checks where id=(p_data->>'checkId')::uuid and user_id=p_actor;
  if not found then raise exception 'Check not found.' using errcode='P0002';end if;
  select * into a from sprout_classroom.assignments where id=s.assignment_id;
 else select * into a from sprout_classroom.assignments where id=(p_data->>'assignmentId')::uuid;end if;
 if not found then raise exception 'Assignment not found.' using errcode='P0002';end if;
 select * into c from sprout_classroom.classes where id=a.class_id;
 if p_action in ('close','review') then
  if c.owner_id<>p_actor then raise exception 'Only this class teacher can do that.' using errcode='42501';end if;
  if p_action='close' then update sprout_classroom.assignments set closed=(p_data->>'closed')::boolean where id=a.id;return jsonb_build_object('ok',true);end if;
  select * into p from sprout_classroom.progress where assignment_id=a.id and user_id=(p_data->>'studentId')::uuid for update;
  if not found then raise exception 'Learner submission not found.' using errcode='P0002';end if;
  if p.mission_status<>'submitted' or p.mission_version<>(p_data->>'version')::int then raise exception 'This submission changed. Refresh before reviewing.';end if;
  if p_data->>'status' not in ('approved','revision') then raise exception 'Choose approve or request revision.';end if;
  if p_data->>'status'='revision' and length(trim(coalesce(p_data->>'feedback','')))<10 then raise exception 'Explain what the learner should improve.';end if;
  if p_data->>'status'='approved' and (p_data->'rubric' is distinct from '{"concept":true,"evidence":true,"reflection":true}'::jsonb) then raise exception 'Check all three success criteria before approving.';end if;
  update sprout_classroom.progress set mission_status=p_data->>'status',feedback=p_data->>'feedback',rubric=p_data->'rubric',reviewed_at=now(),updated_at=now(),completed_at=case when quiz_best>=80 and cardinality(weak_ids)=0 and lessons_completed @> a.lesson_ids and p_data->>'status'='approved' then coalesce(completed_at,now()) else null end where assignment_id=a.id and user_id=p.user_id;
  return jsonb_build_object('ok',true);
 end if;
 select * into p from sprout_classroom.progress where assignment_id=a.id and user_id=p_actor for update;
 if not found then raise exception 'Join this class to open its assignments.' using errcode='42501';end if;
 if a.closed or c.archived then raise exception 'This assignment is closed to new work.';end if;
 if p_action='start' then
  if p.completed_at is not null then raise exception 'This assignment is complete. Use personal practice to keep reviewing.';end if;
  if p_data->>'kind' not in ('check','review') then raise exception 'Choose a check or review.';end if;
  update sprout_classroom.checks set status='abandoned' where assignment_id=a.id and user_id=p_actor and status='active' and created_at<now()-interval '24 hours';
  select * into s from sprout_classroom.checks where assignment_id=a.id and user_id=p_actor and kind=p_data->>'kind' and status='active';
  if found then return sprout_classroom.public_check(s.id,p_actor);end if;
  if p_data->>'kind'='check' and p.quiz_latest<80 and cardinality(p.weak_ids)>0 then raise exception 'Complete the targeted review before retaking this check.';end if;
  if p_data->>'kind'='review' and cardinality(p.weak_ids)=0 then raise exception 'No targeted review is needed. You can take a knowledge check.';end if;
  if exists(select 1 from jsonb_array_elements(p_data->'questions') as qi(value) where not ((qi.value->>'lessonId')::int=any(a.lesson_ids))) then raise exception 'Questions must belong to this assignment.';end if;
  insert into sprout_classroom.checks(assignment_id,class_id,user_id,kind,questions) values(a.id,a.class_id,p_actor,p_data->>'kind',p_data->'questions') returning * into s;
  return sprout_classroom.public_check(s.id,p_actor);
 end if;
 if p_action='answer' then
  select * into s from sprout_classroom.checks where id=(p_data->>'checkId')::uuid and user_id=p_actor for update;
  idx=(p_data->>'index')::int;choice=(p_data->>'choice')::int;
  if idx is null or idx<0 or idx>=5 then raise exception 'Invalid question.';end if;
  q=s.questions->idx;
  if idx<s.question_index then
   if (s.answers->idx->>'choice')::int<>choice then raise exception 'That answer is final.';end if;
   return jsonb_build_object('feedback',jsonb_build_object('correct',s.answers->idx->'correct','answer',q->'answer','explanation',q->>'explanation'),'session',sprout_classroom.public_check(s.id,p_actor));
  end if;
  if s.status<>'active' or idx<>s.question_index then raise exception 'This check moved on. Refresh to continue.';end if;
  if s.created_at<now()-interval '24 hours' then raise exception 'This check expired. Start a new check.';end if;
  if choice is null or choice<0 or choice>=jsonb_array_length(q->'options') then raise exception 'Choose one of the answers.';end if;
  right_answer=choice=(q->>'answer')::int;
  v=jsonb_build_object('lessonId',q->'lessonId','choice',choice,'correct',right_answer);
  update sprout_classroom.checks set answers=answers||jsonb_build_array(v),question_index=question_index+1,status=case when question_index=4 then 'complete' else 'active' end,completed_at=case when question_index=4 then now() else null end where id=s.id returning * into s;
  if s.status='complete' then
   select count(*) filter(where (x->>'correct')::boolean)*20 into score_now from jsonb_array_elements(s.answers) x;
   update sprout_classroom.checks set score=score_now where id=s.id;
   select coalesce(array_agg(lesson_id) filter(where not ok),'{}'),coalesce(array_agg(lesson_id) filter(where ok),'{}') into bad,good from (select (x->>'lessonId')::int lesson_id,bool_and((x->>'correct')::boolean) ok from jsonb_array_elements(s.answers) x group by (x->>'lessonId')::int) t;
   update sprout_classroom.progress set weak_ids=case when s.kind='check' then bad else array(select distinct id from unnest(weak_ids||bad) id where not(id=any(good))) end,quiz_best=case when s.kind='check' then greatest(coalesce(quiz_best,0),score_now) else quiz_best end,quiz_latest=case when s.kind='check' then score_now else quiz_latest end,quiz_attempts=quiz_attempts+case when s.kind='check' then 1 else 0 end,updated_at=now() where assignment_id=a.id and user_id=p_actor;
   perform sprout_classroom.sync(p_actor);
  end if;
  return jsonb_build_object('feedback',jsonb_build_object('correct',right_answer,'answer',q->'answer','explanation',q->>'explanation'),'session',sprout_classroom.public_check(s.id,p_actor));
 end if;
 if p_action='submit' then
  if coalesce(p.quiz_best,0)<80 then raise exception 'Pass the knowledge check before submitting your mission.';end if;
  if cardinality(p.weak_ids)>0 then raise exception 'Finish the targeted review before submitting your mission.';end if;
  if p.mission_status='approved' then raise exception 'This mission has already been approved.';end if;
  update sprout_classroom.progress set mission_data=p_data->'evidence',mission_status='submitted',mission_version=mission_version+1,submitted_at=now(),feedback=null,rubric=null,reviewed_at=null,completed_at=null,updated_at=now() where assignment_id=a.id and user_id=p_actor;
  return jsonb_build_object('ok',true);
 end if;
 raise exception 'Unknown classroom action.';
end $$;

create or replace function public.sprout_classroom_snapshot(p_actor uuid,p_class uuid default null,p_assignment uuid default null) returns jsonb language plpgsql security invoker stable set search_path='' as $$
declare c sprout_classroom.classes; a sprout_classroom.assignments; p sprout_classroom.progress; result jsonb; active_check jsonb;
begin
 if p_actor is null then raise exception 'Sign in to use classrooms.' using errcode='42501';end if;
 if p_class is not null then
  select * into c from sprout_classroom.classes where id=p_class and owner_id=p_actor;
  if not found then raise exception 'Only this class teacher can view its report.' using errcode='42501';end if;
  return jsonb_build_object('class',to_jsonb(c)-'owner_id','assignments',(select coalesce(jsonb_agg(to_jsonb(asg) order by asg.due_at),'[]') from sprout_classroom.assignments asg where asg.class_id=c.id),
   'members',(select coalesce(jsonb_agg(jsonb_build_object('id',m.user_id,'name',m.display_name,'joinedAt',m.joined_at) order by lower(m.display_name)),'[]') from sprout_classroom.members m where m.class_id=c.id),
   'progress',(select coalesce(jsonb_agg(to_jsonb(pr)||jsonb_build_object('mastery',sprout_classroom.mastery(pr.user_id,pr.assignment_id))),'[]') from sprout_classroom.progress pr where pr.class_id=c.id),'serverNow',now());
 end if;
 if p_assignment is not null then
  select * into a from sprout_classroom.assignments where id=p_assignment;
  if not found then raise exception 'Assignment not found.' using errcode='P0002';end if;
  select * into c from sprout_classroom.classes where id=a.class_id;
  select * into p from sprout_classroom.progress where assignment_id=a.id and user_id=p_actor;
  if not found and c.owner_id<>p_actor then raise exception 'Join this class to open its assignments.' using errcode='42501';end if;
  select sprout_classroom.public_check(sess.id,p_actor) into active_check from sprout_classroom.checks sess where sess.assignment_id=a.id and sess.user_id=p_actor and sess.status='active' and sess.created_at>now()-interval '24 hours' order by sess.created_at desc limit 1;
  return jsonb_build_object('assignment',to_jsonb(a),'class',jsonb_build_object('id',c.id,'name',c.name,'teacherName',c.teacher_name,'archived',c.archived),'isTeacher',c.owner_id=p_actor,'progress',case when p.user_id is null then null else to_jsonb(p) end,'mastery',sprout_classroom.mastery(p_actor,a.id),'session',active_check,'serverNow',now());
 end if;
 return jsonb_build_object('ownedClasses',(select coalesce(jsonb_agg(jsonb_build_object('id',cl.id,'name',cl.name,'teacherName',cl.teacher_name,'code',cl.code,'archived',cl.archived,'memberCount',(select count(*) from sprout_classroom.members m where m.class_id=cl.id),'assignmentCount',(select count(*) from sprout_classroom.assignments asg where asg.class_id=cl.id)) order by cl.created_at desc),'[]') from sprout_classroom.classes cl where cl.owner_id=p_actor),
 'joinedClasses',(select coalesce(jsonb_agg(jsonb_build_object('id',cl.id,'name',cl.name,'teacherName',cl.teacher_name,'archived',cl.archived,'displayName',m.display_name)),'[]') from sprout_classroom.members m join sprout_classroom.classes cl on cl.id=m.class_id where m.user_id=p_actor),
 'assignments',(select coalesce(jsonb_agg(jsonb_build_object('assignment',to_jsonb(asg),'className',cl.name,'archived',cl.archived,'progress',to_jsonb(pr)) order by asg.due_at),'[]') from sprout_classroom.progress pr join sprout_classroom.assignments asg on asg.id=pr.assignment_id join sprout_classroom.classes cl on cl.id=asg.class_id where pr.user_id=p_actor),
 'mastery',sprout_classroom.mastery(p_actor),'serverNow',now());
end $$;
revoke all on all functions in schema sprout_classroom from public,anon,authenticated;
grant execute on all functions in schema sprout_classroom to service_role;
revoke all on function public.sprout_classroom_action(uuid,text,jsonb) from public,anon,authenticated;
revoke all on function public.sprout_classroom_snapshot(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.sprout_classroom_action(uuid,text,jsonb),public.sprout_classroom_snapshot(uuid,uuid,uuid) to service_role;
notify pgrst,'reload schema';
