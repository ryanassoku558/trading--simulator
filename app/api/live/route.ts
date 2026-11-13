import {NextRequest,NextResponse} from 'next/server';
import {createHash,randomBytes,randomInt,randomUUID} from 'node:crypto';
import {admin,identify} from '@/lib/billing/server';
import {gamePacks,topicQuestions} from '@/lib/games/content';
import {validateQuestions} from '@/lib/games/authoring';
import {liveBackgroundBucket,decodeBackground,ownedBackground} from '@/lib/games/background';
const cookieName='sprout-live-player';
const backgroundCache=new Map<string,{url:string;until:number}>();
const noStore={'Cache-Control':'no-store'};
function tokenHash(secret:string){return createHash('sha256').update(secret).digest('hex');}
function codeValue(value:unknown){if(typeof value!=='string'||!/^[A-HJ-NP-Z2-9]{6}$/.test(value))throw Error('Enter the six-character room code.');return value;}
function errorResponse(error:unknown){const e=error as {message?:string;code?:string};const message=e.code==='23505'?'That nickname is taken. Choose another.':e.message||'Unable to connect to the game.';return NextResponse.json({error:message},{status:e.code==='42501'?403:e.code==='P0002'?404:400,headers:noStore});}
// The legacy public alias has no server secrets. Its fixed live-game proxy uses
// the same production rooms while keeping browser requests and cookies same-origin.
async function legacyProxy(request:NextRequest,body?:string){
 if(process.env.SUPABASE_SERVICE_ROLE_KEY||request.nextUrl.hostname!=='sprouttrading.vercel.app')return null;
 const headers=new Headers({'origin':'https://sprout-trading.vercel.app'});
 for(const name of ['authorization','content-type']){const value=request.headers.get(name);if(value)headers.set(name,value);}
 const playerCookie=request.cookies.get(cookieName)?.value;if(playerCookie&&/^[a-f0-9]{64}$/.test(playerCookie))headers.set('cookie',cookieName+'='+playerCookie);
 const upstream=await fetch('https://sprout-trading.vercel.app/api/live'+request.nextUrl.search,{method:request.method,headers,body,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(12000)});
 const response=new NextResponse(upstream.body,{status:upstream.status,headers:{...noStore,'Content-Type':'application/json'}});
 const cookie=upstream.headers.get('set-cookie');if(cookie)response.headers.set('set-cookie',cookie);return response;
}
async function refreshBackground(presentation:{backgroundPath?:string;backgroundUrl?:string}|null,db:ReturnType<typeof admin>){
 if(!presentation)return null;
 let path=presentation.backgroundPath;
 if(!path&&presentation.backgroundUrl){try{const url=new URL(presentation.backgroundUrl),base=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL||'https://invalid.local');const prefix='/storage/v1/object/sign/'+liveBackgroundBucket+'/';if(url.origin===base.origin&&url.pathname.startsWith(prefix))path=decodeURIComponent(url.pathname.slice(prefix.length));}catch{/* An old room without a valid stored photo uses the default background. */}}
 if(!path||!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.jpg$/.test(path))return presentation;
 const cached=backgroundCache.get(path);if(cached&&cached.until>Date.now())return {backgroundUrl:cached.url};
 const {data,error}=await db.storage.from(liveBackgroundBucket).createSignedUrl(path,10800);
 if(error||!data)return null;
 if(backgroundCache.size>=200)backgroundCache.delete(backgroundCache.keys().next().value!);
 backgroundCache.set(path,{url:data.signedUrl,until:Date.now()+3600000});
 return {backgroundUrl:data.signedUrl};
}
async function hostId(request:Request){return request.headers.has('authorization')?(await identify(request)).user.id:null;}
export async function GET(request:NextRequest){try{
 const proxied=await legacyProxy(request);if(proxied)return proxied;
 const db=admin();
 if(request.nextUrl.searchParams.get('saved')==='1'){
  const owner=await hostId(request);if(!owner)throw Object.assign(Error('Sign in to view your saved quizzes.'),{code:'42501'});
  const {data,error}=await db.rpc('sprout_live_saved',{p_host:owner});if(error)throw error;
  return NextResponse.json({quizzes:data??[]},{headers:noStore});
 }
 const code=codeValue(request.nextUrl.searchParams.get('code'));
 const secret=request.cookies.get(cookieName)?.value||'';
 const {data,error}=await db.rpc('sprout_live_snapshot',{p_code:code,p_token:tokenHash(secret),p_host:await hostId(request)});
 if(error)throw error;if(data?.presentation)data.presentation=await refreshBackground(data.presentation,db);return NextResponse.json(data,{headers:noStore});
}catch(error){return errorResponse(error);}}
export async function POST(request:NextRequest){try{
 const origin=request.headers.get('origin');if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:'Open the game on this website to continue.'},{status:403,headers:noStore});
 if(Number(request.headers.get('content-length')||0)>2097152)throw Error('This quiz exceeds the 2 MB upload size. Shorten some question text and try again.');
 const text=await request.text();if(Buffer.byteLength(text,'utf8')>2097152)throw Error('This quiz exceeds the 2 MB upload size. Shorten some question text and try again.');
 const proxied=await legacyProxy(request,text);if(proxied)return proxied;
 const body=JSON.parse(text);
 const db=admin();let secret=request.cookies.get(cookieName)?.value;
 if(!secret||!/^[a-f0-9]{64}$/.test(secret))secret=randomBytes(32).toString('hex');
 let result:unknown;
 if(body.action==='upload-background'){
  if(!request.headers.has('authorization'))throw Object.assign(Error('Sign in to add a game background.'),{code:'42501'});
  const {user}=await identify(request),bytes=decodeBackground(body.image);
  const {data:bucket,error:bucketError}=await db.storage.getBucket(liveBackgroundBucket);
  if(!bucket){
   if(bucketError&&![404,400].includes(Number(bucketError.status)))throw Error('Background storage is temporarily unavailable.');
   const {error}=await db.storage.createBucket(liveBackgroundBucket,{public:false,fileSizeLimit:800000,allowedMimeTypes:['image/jpeg']});
   if(error&&!/already exists/i.test(error.message))throw Error('Background storage is temporarily unavailable.');
  }
  const storage=db.storage.from(liveBackgroundBucket);
  const {data:files,error:listError}=await storage.list(user.id,{limit:100,sortBy:{column:'created_at',order:'desc'}});
  if(listError)throw Error('Unable to check your background uploads. Please try again.');
  const recent=(files??[]).filter(f=>Date.parse(f.created_at??'')>Date.now()-86400000);
  if(recent.length>=20)throw Error('You can upload 20 backgrounds per day. Reuse your saved background or try tomorrow.');
  const path=user.id+'/'+randomUUID()+'.jpg';
  const {error}=await storage.upload(path,bytes,{contentType:'image/jpeg',cacheControl:'10800',upsert:false});
  if(error)throw Error('The background could not be uploaded. Please try again.');
  return NextResponse.json({backgroundPath:path},{headers:noStore});
 }else if(body.action==='create'){
  if(!request.headers.has('authorization'))throw Object.assign(Error('Sign in to host a game. Anyone with a Sprout account can host.'),{code:'42501'});
  const {user}=await identify(request);
  const pack=gamePacks.find(p=>p.id===body.pack);if(!pack)throw Error('Choose a quiz topic.');
  const title=typeof body.title==='string'&&body.title.trim()?body.title.trim():pack.title;if(title.length>80)throw Error('Keep the quiz title under 80 characters.');
  const questions=validateQuestions(body.questions??topicQuestions(pack.id));
  if(body.backgroundPath){
   if(!ownedBackground(body.backgroundPath,user.id))throw Error('Choose a background uploaded by your account.');
   const {data,error}=await db.storage.from(liveBackgroundBucket).createSignedUrl(body.backgroundPath,10800);
   if(error||!data)throw Error('Upload your background again before creating the room.');
   Object.assign(questions[0],{presentation:{backgroundPath:body.backgroundPath,backgroundUrl:data.signedUrl}});
  }
  const seconds=[5,10,15,20,30,45,60,90,120,240].includes(body.seconds)?body.seconds:45;
  let code='';for(let attempt=0;attempt<3;attempt++){
   const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';code=Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join('');
   const {error}=await db.rpc('sprout_live_save',{p_host:user.id,p_code:code,p_title:title,p_questions:questions,p_seconds:seconds});
   if(!error)break;if(error.code!=='23505'||attempt===2)throw error;
  }
  result={code};
 }else{
  const code=codeValue(body.code),action=body.action;
  if(!['join','answer','start','reveal','next','end','reset','activate'].includes(action))throw Error('Unknown game action.');
  const owner=['start','reveal','next','end','reset','activate'].includes(action)?await hostId(request):null;
  if(['start','reveal','next','end','reset','activate'].includes(action)&&!owner)throw Object.assign(Error('Sign in to control your hosted game.'),{code:'42501'});
  const {data,error}=await db.rpc('sprout_live_dispatch',{p_code:code,p_token:tokenHash(secret),p_host:owner,p_action:action,p_index:Number.isInteger(body.index)?body.index:0,p_choice:Number.isInteger(body.choice)?body.choice:null,p_nickname:typeof body.nickname==='string'?body.nickname.trim():null,p_generation:Number.isInteger(body.generation)?body.generation:null});
  if(error)throw error;result={...data,code};
 }
 const response=NextResponse.json(result,{headers:noStore});response.cookies.set(cookieName,secret,{httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',maxAge:7200,path:'/api/live'});return response;
}catch(error){return errorResponse(error);}}
