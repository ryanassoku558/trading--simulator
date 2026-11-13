import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {NextRequest} from 'next/server';
const mock=vi.hoisted(()=>({rpc:vi.fn(),identify:vi.fn(),getBucket:vi.fn(),createBucket:vi.fn(),list:vi.fn(),remove:vi.fn(),upload:vi.fn(),sign:vi.fn()}));
vi.mock('@/lib/billing/server',()=>({admin:()=>({rpc:mock.rpc,storage:{getBucket:mock.getBucket,createBucket:mock.createBucket,from:()=>({list:mock.list,remove:mock.remove,upload:mock.upload,createSignedUrl:mock.sign})}}),identify:mock.identify}));
import {POST,GET} from '@/app/api/live/route';
const host='00000000-0000-4000-8000-000000000001';
function request(body:object,headers:Record<string,string>={}){return new NextRequest('https://sprout-trading.vercel.app/api/live',{method:'POST',headers:{'content-type':'application/json',origin:'https://sprout-trading.vercel.app',...headers},body:JSON.stringify(body)});}
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
beforeEach(()=>{vi.clearAllMocks();mock.rpc.mockResolvedValue({data:{ok:true},error:null});mock.identify.mockResolvedValue({user:{id:host}});});
it('requires an account to host and ignores a forged host id in the body',async()=>{
 expect((await POST(request({action:'create',pack:'0',host_id:host}))).status).toBe(403);expect(mock.rpc).not.toHaveBeenCalled();
 const response=await POST(request({action:'create',pack:'0',host_id:'fake'},{authorization:'Bearer verified-session'}));expect(response.status).toBe(200);expect(mock.identify).toHaveBeenCalledOnce();expect(mock.rpc.mock.calls[0][0]).toBe('sprout_live_save');expect(mock.rpc.mock.calls[0][1].p_host).toBe(host);expect(mock.rpc.mock.calls[0][1].p_questions).toHaveLength(4);
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

it('creates games from a non-Starter module or an individual lesson',async()=>{
 for(const pack of ['40','lesson:1']){mock.rpc.mockClear();const response=await POST(request({action:'create',pack},{authorization:'Bearer verified-session'}));expect(response.status).toBe(200);const questions=mock.rpc.mock.calls[0][1].p_questions;expect(questions.length).toBeGreaterThan(0);if(pack==='lesson:1'){expect(questions).toHaveLength(1);expect(questions[0].question).toBe('What does a share represent?');}}
});

it('uploads compressed JPEGs only for authenticated hosts and keeps storage private',async()=>{
 const image='data:image/jpeg;base64,'+Buffer.from([255,216,255,224,0,0,255,217]).toString('base64');
 expect((await POST(request({action:'upload-background',image}))).status).toBe(403);
 mock.getBucket.mockResolvedValue({data:{public:false},error:null});mock.list.mockResolvedValue({data:[],error:null});mock.upload.mockResolvedValue({error:null});
 const response=await POST(request({action:'upload-background',image},{authorization:'Bearer verified-session'}));expect(response.status).toBe(200);
 const {backgroundPath}=await response.json();expect(backgroundPath).toMatch(new RegExp('^'+host+'/[a-f0-9-]+\\.jpg$'));expect(mock.upload.mock.calls[0][2]).toEqual({contentType:'image/jpeg',cacheControl:'10800',upsert:false});expect(mock.rpc).not.toHaveBeenCalled();
 expect((await POST(request({action:'upload-background',image:'data:image/svg+xml;base64,PHN2Zz4='},{authorization:'Bearer verified-session'}))).status).toBe(400);
});
it('limits uploads and signs only owned background paths when creating a room',async()=>{
 const path=host+'/00000000-0000-4000-8000-000000000002.jpg';
 mock.sign.mockResolvedValue({data:{signedUrl:'https://storage.example/signed-photo'},error:null});
 const response=await POST(request({action:'create',pack:'0',backgroundPath:path},{authorization:'Bearer verified-session'}));expect(response.status).toBe(200);expect(mock.sign).toHaveBeenCalledWith(path,10800);expect(mock.rpc.mock.calls[0][1].p_questions[0].presentation).toEqual({backgroundPath:path,backgroundUrl:'https://storage.example/signed-photo'});
 mock.rpc.mockClear();expect((await POST(request({action:'create',pack:'0',backgroundPath:path.replace(host,'00000000-0000-4000-8000-000000000099')},{authorization:'Bearer verified-session'}))).status).toBe(400);expect(mock.rpc).not.toHaveBeenCalled();
 mock.getBucket.mockResolvedValue({data:{public:false},error:null});mock.list.mockImplementation((_prefix:string,options:{limit:number})=>Promise.resolve({data:Array(200).fill({created_at:new Date().toISOString()}).slice(0,options.limit),error:null}));mock.upload.mockClear();
 const image='data:image/jpeg;base64,'+Buffer.from([255,216,255,224,0,0,255,217]).toString('base64');expect((await POST(request({action:'upload-background',image},{authorization:'Bearer verified-session'}))).status).toBe(400);expect(mock.upload).not.toHaveBeenCalled();
});

it('loads only the authenticated host’s saved quizzes and requires a host for activation or reset',async()=>{
 const guest=await GET(new NextRequest('https://sprout-trading.vercel.app/api/live?saved=1'));expect(guest.status).toBe(403);expect(mock.rpc).not.toHaveBeenCalled();
 mock.rpc.mockResolvedValue({data:[{code:'TEST22',title:'Saved quiz'}],error:null});const hostResult=await GET(new NextRequest('https://sprout-trading.vercel.app/api/live?saved=1&host_id=forged',{headers:{authorization:'Bearer verified-session'}}));expect(hostResult.status).toBe(200);expect(mock.rpc).toHaveBeenCalledWith('sprout_live_saved',{p_host:host});
 for(const action of ['reset','activate'])expect((await POST(request({action,code:'TEST22'}))).status).toBe(403);
 mock.rpc.mockClear();await POST(request({action:'reset',code:'TEST22',generation:3},{authorization:'Bearer verified-session'}));expect(mock.rpc).toHaveBeenCalledWith('sprout_live_dispatch',expect.objectContaining({p_host:host,p_generation:3,p_action:'reset'}));
});
it('refreshes a saved room photo without deleting older saved images',async()=>{
 const path=host+'/00000000-0000-4000-8000-000000000005.jpg';mock.rpc.mockResolvedValue({data:{phase:'waiting',presentation:{backgroundPath:path,backgroundUrl:'expired'}},error:null});mock.sign.mockResolvedValue({data:{signedUrl:'https://storage.example/renewed'},error:null});const result=await GET(new NextRequest('https://sprout-trading.vercel.app/api/live?code=TEST22'));expect((await result.json()).presentation.backgroundUrl).toBe('https://storage.example/renewed');expect(mock.remove).not.toHaveBeenCalled();
});
it('returns an answer-key editor only for the verified host and saves validated edits to the same room',async()=>{
 const url='https://sprout-trading.vercel.app/api/live?edit=1&code=EDTR22';expect((await GET(new NextRequest(url))).status).toBe(403);expect(mock.rpc).not.toHaveBeenCalled();
 const questions=[{question:'Editable question?',options:['First','Second'],answer:1,explanation:'Second is correct.'}];mock.rpc.mockResolvedValueOnce({data:{title:'My saved quiz',seconds:45,questions,generation:2,phase:'waiting'},error:null});
 const loaded=await GET(new NextRequest(url+'&host_id=forged',{headers:{authorization:'Bearer fixture'}}));expect(loaded.status).toBe(200);expect(mock.rpc).toHaveBeenCalledWith('sprout_live_editor',{p_code:'EDTR22',p_host:host});expect((await loaded.json()).draft.questions[0].answer).toBe(1);
 mock.rpc.mockClear();const result=await POST(request({action:'update',code:'EDTR22',title:'Edited title',pack:'0',questions,seconds:90,generation:2},{authorization:'Bearer fixture'}));expect(result.status).toBe(200);expect(await result.json()).toEqual({code:'EDTR22'});expect(mock.rpc).toHaveBeenCalledWith('sprout_live_update',{p_code:'EDTR22',p_host:host,p_title:'Edited title',p_questions:questions,p_seconds:90,p_generation:2});
 mock.rpc.mockClear();expect((await POST(request({action:'update',code:'EDTR22',title:'Edited',pack:'0',questions:[{...questions[0],answer:9}],generation:2},{authorization:'Bearer fixture'}))).status).toBe(400);expect(mock.rpc).not.toHaveBeenCalled();
});
it('protects slide photo ownership and signs only the current question image for joined players',async()=>{
 const path=host+'/00000000-0000-4000-8000-000000000009.jpg';mock.sign.mockResolvedValue({data:{signedUrl:'https://storage.example/slide-photo'},error:null});
 expect((await GET(new NextRequest('https://sprout-trading.vercel.app/api/live?photo='+path))).status).toBe(403);
 const preview=await GET(new NextRequest('https://sprout-trading.vercel.app/api/live?photo='+path,{headers:{authorization:'Bearer fixture'}}));expect(preview.status).toBe(200);expect((await preview.json()).imageUrl).toBe('https://storage.example/slide-photo');
 mock.rpc.mockResolvedValue({data:{question:{text:'Picture question',options:['A','B'],imagePath:path,imageAlt:'Example chart'}},error:null});const snapshot=await GET(new NextRequest('https://sprout-trading.vercel.app/api/live?code=TEST22'));const view=await snapshot.json();expect(view.question.imageUrl).toBe('https://storage.example/slide-photo');expect(view.question.imagePath).toBeUndefined();expect(view.question.answer).toBeUndefined();
 mock.rpc.mockClear();const questions=[{question:'Which image?',options:['One','Two'],answer:1,explanation:'Second.',imagePath:path.replace(host,'00000000-0000-4000-8000-000000000099')}];expect((await POST(request({action:'update',code:'TEST22',title:'Photo quiz',pack:'0',questions,generation:0},{authorization:'Bearer fixture'}))).status).toBe(400);expect(mock.rpc).not.toHaveBeenCalled();
});
