import type {SupabaseClient} from '@supabase/supabase-js';
import {randomInt} from 'node:crypto';
import {lessons} from '@/lib/education';
import {stocks} from '@/lib/market';
import {validAssetQuantity} from '@/lib/market/quantity';
import {buildCheckQuestions} from './learning';
import type {AssignmentDetail,MissionEvidence,MissionKind} from './types';
export type ClassroomDb=Pick<SupabaseClient,'rpc'|'from'>;
export const uuid=(v:unknown)=>{if(typeof v!=='string'||!/^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(v))throw Error('Open a valid class or assignment.');return v;};
function text(v:unknown,label:string,min:number,max:number){if(typeof v!=='string'||v.trim().length<min||v.length>max)throw Error(`${label} must contain ${min}–${max} characters.`);return v.trim();}
function code(v:unknown){if(typeof v!=='string'||!/^[A-HJ-NP-Z2-9]{8}$/.test(v))throw Error('Enter the eight-character class code.');return v;}
function newCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:8},()=>alphabet[randomInt(alphabet.length)]).join('');}
export async function classroomSnapshot(db:ClassroomDb,userId:string,query:{classId?:string;assignmentId?:string}={}){const {data,error}=await db.rpc('sprout_classroom_snapshot',{p_actor:userId,p_class:query.classId?uuid(query.classId):null,p_assignment:query.assignmentId?uuid(query.assignmentId):null});if(error)throw error;return data;}
export async function missionEvidence(db:ClassroomDb,userId:string,detail:AssignmentDetail,body:Record<string,unknown>):Promise<MissionEvidence>{const kind=detail.assignment.mission,rationale=text(body.rationale,'Your reasoning',40,2000),reflection=text(body.reflection,'Your reflection',40,2000);const ticker=typeof body.ticker==='string'?body.ticker.toUpperCase():'';if(kind!=='trade_reflection'&&!stocks.some(s=>s.ticker===ticker))throw Error('Choose an asset from the simulator.');
 if(kind==='risk_plan'){const entry=Number(body.entry),stop=Number(body.stop),quantity=Number(body.quantity);if(![entry,stop,quantity].every(n=>Number.isFinite(n)&&n>0)||entry>1e9||stop>=entry||quantity>1e6||!validAssetQuantity(ticker,quantity))throw Error('Enter a positive planned entry, a lower stop, and a valid asset quantity.');return {kind,ticker,entry,stop,quantity,plannedRisk:Math.round((entry-stop)*quantity*100)/100,rationale,reflection};}
 if(kind==='comparison'){const secondTicker=typeof body.secondTicker==='string'?body.secondTicker.toUpperCase():'';if(secondTicker===ticker||!stocks.some(s=>s.ticker===secondTicker))throw Error('Choose two different assets from the simulator.');return {kind,ticker,secondTicker,rationale,reflection};}
 const tradeId=text(body.tradeId,'Trade reference',1,120);const {data,error}=await db.from('paper_accounts').select('account').eq('user_id',userId).maybeSingle();if(error)throw error;const trade=data?.account?.trades?.find((t:{id:string})=>t.id===tradeId);if(!trade||!stocks.some(s=>s.ticker===trade.ticker)||!['buy','sell'].includes(trade.side)||!Number.isFinite(trade.shares)||!Number.isFinite(trade.price)||!Number.isFinite(Date.parse(trade.date))||Date.parse(trade.date)<Date.parse(detail.assignment.created_at))throw Error('Choose a saved practice trade made after this assignment was published.');return {kind,rationale,reflection,trade:{id:trade.id,ticker:trade.ticker,side:trade.side,shares:trade.shares,price:trade.price,date:trade.date}};
}
export async function classroomAction(db:ClassroomDb,userId:string,action:unknown,body:Record<string,unknown>){let payload:Record<string,unknown>={};
 switch(action){
 case 'create':payload={code:newCode(),name:text(body.name,'Class name',2,80),teacherName:text(body.teacherName,'Teacher display name',2,60)};break;
 case 'lookup':payload={code:code(body.code)};break;
 case 'join':payload={code:code(body.code),displayName:text(body.displayName,'Class display name',2,60)};break;
 case 'sync':break;
 case 'leave':payload={classId:uuid(body.classId)};break;
 case 'archive':if(typeof body.archived!=='boolean')throw Error('Choose whether to archive this class.');payload={classId:uuid(body.classId),archived:body.archived};break;
 case 'rotate':payload={classId:uuid(body.classId),code:newCode()};break;
 case 'assign':{if(!Array.isArray(body.lessonIds)||!body.lessonIds.length||body.lessonIds.length>lessons.length||body.lessonIds.some(id=>!Number.isInteger(id)||!lessons.some(l=>l.id===id)))throw Error('Choose valid lessons from the curriculum.');const dueAt=typeof body.dueAt==='string'?body.dueAt:'';if(!Number.isFinite(Date.parse(dueAt))||Date.parse(dueAt)<=Date.now())throw Error('Choose a future assignment deadline.');const mission=body.mission as MissionKind;if(!['risk_plan','comparison','trade_reflection'].includes(mission))throw Error('Choose a simulator mission.');payload={classId:uuid(body.classId),title:text(body.title,'Assignment title',2,120),instructions:typeof body.instructions==='string'?text(body.instructions||' ','Instructions',0,2000):'',lessonIds:lessons.filter(l=>(body.lessonIds as number[]).includes(l.id)).map(l=>l.id),dueAt:new Date(dueAt).toISOString(),mission};break;}
 case 'close':if(typeof body.closed!=='boolean')throw Error('Choose an assignment status.');payload={assignmentId:uuid(body.assignmentId),closed:body.closed};break;
 case 'start':{const assignmentId=uuid(body.assignmentId),detail=await classroomSnapshot(db,userId,{assignmentId}) as AssignmentDetail;if(detail.isTeacher||!detail.progress)throw Error('Open this assignment as an enrolled learner.');if(!['check','review'].includes(String(body.kind)))throw Error('Choose a check or targeted review.');const ids=body.kind==='review'?detail.progress.weak_ids:detail.assignment.lesson_ids;payload={assignmentId,kind:body.kind,questions:buildCheckQuestions(ids,()=>randomInt(1000000)/1000000)};break;}
 case 'answer':if(!Number.isInteger(body.index)||Number(body.index)<0||Number(body.index)>4||!Number.isInteger(body.choice)||Number(body.choice)<0)throw Error('Choose one answer for the current question.');payload={checkId:uuid(body.checkId),index:body.index,choice:body.choice};break;
 case 'submit':{const assignmentId=uuid(body.assignmentId),detail=await classroomSnapshot(db,userId,{assignmentId}) as AssignmentDetail;if(detail.isTeacher||!detail.progress)throw Error('Open this assignment as an enrolled learner.');payload={assignmentId,evidence:await missionEvidence(db,userId,detail,body)};break;}
 case 'review':{if(!['approved','revision'].includes(String(body.status))||!Number.isInteger(body.version))throw Error('Choose a review decision for the current submission.');const r=body.rubric as Record<string,unknown>|undefined;payload={assignmentId:uuid(body.assignmentId),studentId:uuid(body.studentId),version:body.version,status:body.status,feedback:typeof body.feedback==='string'?text(body.feedback||' ','Feedback',0,2000):'',rubric:{concept:r?.concept===true,evidence:r?.evidence===true,reflection:r?.reflection===true}};break;}
 default:throw Error('Unknown classroom action.');
 }
 for(let attempt=0;attempt<3;attempt++){const {data,error}=await db.rpc('sprout_classroom_action',{p_actor:userId,p_action:action,p_data:payload});if(!error)return data;if(error.code!=='23505'||!['create','rotate'].includes(String(action))||attempt===2)throw error;payload.code=newCode();}
}
