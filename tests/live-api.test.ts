import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {NextRequest} from 'next/server';
const mock=vi.hoisted(()=>({rpc:vi.fn(),identify:vi.fn()}));
vi.mock('@/lib/billing/server',()=>({admin:()=>({rpc:mock.rpc}),identify:mock.identify}));
import {POST,GET} from '@/app/api/live/route';
const host='00000000-0000-4000-8000-000000000001';
function request(body:object,headers:Record<string,string>={}){return new NextRequest('https://sprout-trading.vercel.app/api/live',{method:'POST',headers:{'content-type':'application/json',origin:'https://sprout-trading.vercel.app',...headers},body:JSON.stringify(body)});}
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
beforeEach(()=>{vi.clearAllMocks();mock.rpc.mockResolvedValue({data:{ok:true},error:null});mock.identify.mockResolvedValue({user:{id:host}});});
it('requires an account to host and ignores a forged host id in the body',async()=>{
 expect((await POST(request({action:'create',pack:'0',host_id:host}))).status).toBe(403);expect(mock.rpc).not.toHaveBeenCalled();
 const response=await POST(request({action:'create',pack:'0',host_id:'fake'},{authorization:'Bearer verified-session'}));expect(response.status).toBe(200);expect(mock.identify).toHaveBeenCalledOnce();expect(mock.rpc.mock.calls[0][1].p_host).toBe(host);expect(mock.rpc.mock.calls[0][1].p_questions).toHaveLength(5);
});
it('joins without an account and keeps the random player secret in an HttpOnly cookie',async()=>{
 const response=await POST(request({action:'join',code:'TEST22',nickname:'Guest'}));expect(response.status).toBe(200);expect(mock.identify).not.toHaveBeenCalled();expect(mock.rpc.mock.calls[0][1].p_token).toHaveLength(64);expect(mock.rpc.mock.calls[0][1].p_host).toBeNull();expect(response.headers.get('set-cookie')).toContain('HttpOnly');expect(response.headers.get('set-cookie')).toContain('Secure');expect(await response.json()).toEqual({ok:true,code:'TEST22'});
});
it('rejects foreign origins and guest room-control attempts',async()=>{
 expect((await POST(request({action:'join',code:'TEST22',nickname:'Guest'},{origin:'https://elsewhere.example'}))).status).toBe(403);
 expect((await POST(request({action:'next',code:'TEST22',host_id:host}))).status).toBe(403);expect(mock.rpc).not.toHaveBeenCalled();
});
it('passes only the server-derived user and cookie hash to the private snapshot',async()=>{
 mock.rpc.mockResolvedValue({data:{phase:'waiting',question:null},error:null});const result=await GET(new NextRequest('https://sprout-trading.vercel.app/api/live?code=TEST22&host_id=forged',{headers:{cookie:'sprout-live-player='+'a'.repeat(64)}}));expect(result.status).toBe(200);expect(mock.rpc.mock.calls[0][0]).toBe('sprout_live_snapshot');expect(mock.rpc.mock.calls[0][1].p_host).toBeNull();expect(mock.rpc.mock.calls[0][1].p_token).not.toBe('a'.repeat(64));expect(result.headers.get('Cache-Control')).toBe('no-store');
});

it('legacy alias forwards only live-game requests to the fixed primary service without copying secrets',async()=>{
 vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','');const upstream=vi.fn().mockResolvedValue(new Response(JSON.stringify({ok:true,code:'TEST22'}),{headers:{'content-type':'application/json','set-cookie':'sprout-live-player=test; HttpOnly; Secure; Path=/api/live; SameSite=Lax'}}));vi.stubGlobal('fetch',upstream);
 const response=await POST(new NextRequest('https://sprouttrading.vercel.app/api/live',{method:'POST',headers:{origin:'https://sprouttrading.vercel.app','content-type':'application/json'},body:JSON.stringify({action:'join',code:'TEST22',nickname:'Guest'})}));
 expect(response.status).toBe(200);expect(upstream.mock.calls[0][0]).toBe('https://sprout-trading.vercel.app/api/live');expect(response.headers.get('set-cookie')).toContain('HttpOnly');expect(mock.rpc).not.toHaveBeenCalled();
});

it('accepts the host’s custom answer key and rejects invalid quizzes before room creation',async()=>{
 const questions=[{question:'Custom question',options:['First','Second','Third','Fourth'],answer:3,explanation:'Fourth is correct.'}];
 const response=await POST(request({action:'create',pack:'0',title:'My own quiz',seconds:120,questions:Array(25).fill(questions[0])},{authorization:'Bearer verified-session'}));expect(response.status).toBe(200);expect(mock.rpc.mock.calls[0][1].p_questions).toEqual(Array(25).fill(questions[0]));expect(mock.rpc.mock.calls[0][1].p_title).toBe('My own quiz');expect(mock.rpc.mock.calls[0][1].p_seconds).toBe(120);
 mock.rpc.mockClear();const invalid=await POST(request({action:'create',pack:'0',questions:[{...questions[0],answer:4}]},{authorization:'Bearer verified-session'}));expect(invalid.status).toBe(400);expect(mock.rpc).not.toHaveBeenCalled();
});
