import {getCompanyResearch} from '@/lib/research/sec';
export const runtime='nodejs';
export const maxDuration=60;
export async function GET(request:Request){
 const symbol=new URL(request.url).searchParams.get('symbol')?.trim().toUpperCase()??'';
 if(!/^[A-Z][A-Z0-9.\-]{0,14}$/.test(symbol))return Response.json({error:'Enter a US company ticker, for example AAPL.'},{status:400});
 try{
  const company=await getCompanyResearch(symbol);
  if(!company)return Response.json({error:'No SEC company match. Funds, crypto, foreign listings and some share classes may not have supported US-GAAP company facts.',source:'https://www.sec.gov/edgar/search/'},{status:404});
  return Response.json(company,{headers:{'Cache-Control':'public, s-maxage=3600, stale-while-revalidate=3600'}});
 }catch(error){return Response.json({error:error instanceof Error&&/^(SEC data|Research is busy)/.test(error.message)?error.message:'SEC research is temporarily unavailable. Open the original source or retry later.',source:'https://www.sec.gov/edgar/search/'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
