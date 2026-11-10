// Optional AI reflection. Requires OPENAI_API_KEY and Supabase auth verification.
// Never sends an email, account balance, or trading history to the model.
const supabaseUrl='https://kbphftwnggadpfbyctve.supabase.co';
const publishableKey='sb_publishable_e5yQwNGx2QjM1nj0vBhnWA_rdLHikaP';
const tickers=new Set(['AAPL','MSFT','NVDA','AMZN','GOOGL','TSLA']);
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI coach is not configured.'});
 if(!process.env.UPSTASH_REDIS_REST_URL||!process.env.UPSTASH_REDIS_REST_TOKEN)return res.status(503).json({error:'AI coach rate limiting is not configured.'});
 const token=(req.headers.authorization||'').match(/^Bearer ([A-Za-z0-9._-]+)$/)?.[1];
 if(!token)return res.status(401).json({error:'Sign in to use AI coach.'});
 try{
  const auth=await fetch(supabaseUrl+'/auth/v1/user',{headers:{apikey:publishableKey,Authorization:'Bearer '+token},signal:AbortSignal.timeout(6000)});
  if(!auth.ok)return res.status(401).json({error:'Session expired. Sign in again.'});
  const identity=await auth.json();
  if(!identity.id)return res.status(401).json({error:'Invalid session.'});
  // Atomic fixed-window quota shared across all serverless instances: 10 requests per user per hour.
  const bucket='sprout:coach:'+identity.id+':'+Math.floor(Date.now()/3600000);
  const rate=await fetch(process.env.UPSTASH_REDIS_REST_URL+'/pipeline',{method:'POST',headers:{Authorization:'Bearer '+process.env.UPSTASH_REDIS_REST_TOKEN,'Content-Type':'application/json'},body:JSON.stringify([['INCR',bucket],['EXPIRE',bucket,3700]]),signal:AbortSignal.timeout(4000)});
  if(!rate.ok)throw Error('Rate limiter unavailable');
  const limits=await rate.json();
  const used=Number(limits?.[0]?.result);
  if(!Number.isInteger(used)||used<1)throw Error('Rate limiter unavailable');
  if(used>10)return res.status(429).json({error:'AI coach limit reached (10 per hour). Try again later.'});
  const input=typeof req.body==='string'?JSON.parse(req.body):req.body;
  const {symbol,side,quantity,price}=input||{};
  if(!tickers.has(symbol)||!['buy','sell'].includes(side)||!Number.isInteger(quantity)||quantity<1||quantity>100000||!Number.isFinite(price)||price<=0||price>1000000)return res.status(400).json({error:'Invalid virtual trade.'});
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',max_output_tokens:250,store:false,instructions:'You are an educational paper-trading coach. Provide 3 short, clear sentences explaining position sizing, concentration and uncertainty. Never give personalized buy/sell advice, guaranteed returns or forecasts. The trade is virtual.',input:JSON.stringify({symbol,side,quantity,price})}),signal:AbortSignal.timeout(12000)});
  if(!response.ok)return res.status(502).json({error:'AI coach temporarily unavailable.'});
  const result=await response.json();
  const explanation=(result.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join(' ').trim();
  if(!explanation)return res.status(502).json({error:'No explanation returned.'});
  return res.status(200).json({explanation});
 }catch{return res.status(502).json({error:'AI coach unavailable. Use the built-in explanation instead.'});}
}
