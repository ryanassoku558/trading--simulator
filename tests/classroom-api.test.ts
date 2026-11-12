import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {NextRequest} from 'next/server';
const mock=vi.hoisted(()=>({rpc:vi.fn(),identify:vi.fn(),from:vi.fn()}));
vi.mock('@/lib/billing/server',()=>({identify:mock.identify}));
import {GET,POST} from '@/app/api/classroom/route';
import {classroomAction,missionEvidence} from '@/lib/classroom/service';
const user='00000000-0000-4000-8000-000000000002',assignmentId='00000000-0000-4000-8000-000000000010';
function request(body:object,headers:Record<string,string>={}){return new NextRequest('https://sprout-trading.vercel.app/api/classroom',{method:'POST',headers:{origin:'https://sprout-trading.vercel.app','content-type':'application/json',authorization:'Bearer verified',...headers},body:JSON.stringify(body)});}
beforeEach(()=>{vi.clearAllMocks();mock.rpc.mockResolvedValue({data:{ok:true},error:null});mock.identify.mockResolvedValue({user:{id:user},db:{rpc:mock.rpc,from:mock.from}});});afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it('requires a real account and ignores supplied actor, owner and grading claims',async()=>{
 expect((await GET(new NextRequest('https://sprout-trading.vercel.app/api/classroom'))).status).toBe(403);expect(mock.identify).not.toHaveBeenCalled();
 const response=await POST(request({action:'create',name:'Finance',teacherName:'Teacher',actor:'forged',owner_id:'forged'}));expect(response.status).toBe(200);expect(mock.rpc.mock.calls[0][1].p_actor).toBe(user);expect(mock.rpc.mock.calls[0][1].p_data.owner_id).toBeUndefined();expect(mock.rpc.mock.calls[0][1].p_data.code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
 mock.rpc.mockClear();await POST(request({action:'answer',checkId:assignmentId,index:0,choice:1,score:100,correct:true,user_id:'forged'}));expect(mock.rpc.mock.calls[0][1].p_data).toEqual({checkId:assignmentId,index:0,choice:1});
});
it('rejects foreign origins, invalid lessons, oversized bodies and invalid deadlines before writes',async()=>{
 expect((await POST(request({action:'join',code:'CLASS234',displayName:'Student'},{origin:'https://elsewhere.example'}))).status).toBe(403);
 expect((await POST(request({action:'assign',classId:assignmentId,title:'Task',lessonIds:[999999],dueAt:'2100-01-01',mission:'risk_plan'}))).status).toBe(400);
 expect((await POST(request({action:'assign',classId:assignmentId,title:'Task',lessonIds:[1],dueAt:'2000-01-01',mission:'risk_plan'}))).status).toBe(400);
 expect((await POST(request({action:'create',name:'x'.repeat(20000),teacherName:'Teacher'}))).status).toBe(400);expect(mock.rpc).not.toHaveBeenCalled();
});
it('builds check questions from the enrolled assignment, never from a submitted answer key',async()=>{
 mock.rpc.mockImplementation(async(name:string)=>name==='sprout_classroom_snapshot'?{data:{assignment:{lesson_ids:[1]},isTeacher:false,progress:{weak_ids:[]}},error:null}:{data:{id:assignmentId},error:null});
 const result=await POST(request({action:'start',assignmentId,kind:'check',questions:[{answer:0,lessonId:9999}]}));expect(result.status).toBe(200);const payload=mock.rpc.mock.calls.find(c=>c[0]==='sprout_classroom_action')![1].p_data;expect(payload.questions).toHaveLength(5);expect(payload.questions.every((q:any)=>q.lessonId===1)).toBe(true);expect(payload.questions[0].question).toBe('What does a share represent?');
});
it('computes mission risk on the server and filters saved trade evidence by the verified student',async()=>{
 const detail:any={assignment:{mission:'risk_plan',created_at:'2026-01-01'}};const evidence=await missionEvidence({rpc:mock.rpc,from:mock.from} as any,user,detail,{ticker:'AAPL',entry:100,stop:98,quantity:5,plannedRisk:0,rationale:'I compared the chart with the lesson and planned a limited position.',reflection:'I learned that the planned stop can differ from an actual fill price.'});expect(evidence.plannedRisk).toBe(10);
 await expect(missionEvidence({rpc:mock.rpc,from:mock.from} as any,user,detail,{ticker:'AAPL',entry:100,stop:120,quantity:5,rationale:'x'.repeat(40),reflection:'y'.repeat(40)})).rejects.toThrow(/lower stop/);
 const eq=vi.fn().mockReturnValue({maybeSingle:async()=>({data:{account:{trades:[{id:'trade-one',ticker:'AAPL',side:'buy',shares:1,price:100,date:'2026-02-01'}]}},error:null})});mock.from.mockReturnValue({select:()=>({eq})});
 const trade=await missionEvidence({rpc:mock.rpc,from:mock.from} as any,user,{assignment:{mission:'trade_reflection',created_at:'2026-01-01'}} as any,{tradeId:'trade-one',rationale:'x'.repeat(40),reflection:'y'.repeat(40)});expect(eq).toHaveBeenCalledWith('user_id',user);expect(trade.trade?.ticker).toBe('AAPL');expect(trade.trade).not.toHaveProperty('portfolioValue');
});
it('legacy public address forwards classroom requests to the fixed canonical endpoint',async()=>{
 vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','');const upstream=vi.fn().mockResolvedValue(new Response('{"ok":true}',{headers:{'content-type':'application/json'}}));vi.stubGlobal('fetch',upstream);
 const response=await GET(new NextRequest('https://sprouttrading.vercel.app/api/classroom',{headers:{authorization:'Bearer verified'}}));expect(response.status).toBe(200);expect(upstream.mock.calls[0][0]).toBe('https://sprout-trading.vercel.app/api/classroom');expect(mock.identify).not.toHaveBeenCalled();expect(response.headers.get('cache-control')).toBe('no-store');
});
