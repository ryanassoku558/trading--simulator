// Optional market quotes. Configure FINNHUB_API_KEY in Vercel server-side environment settings.
// This endpoint never exposes the provider token to browser clients.
const symbols=['AAPL','MSFT','NVDA','AMZN','GOOGL','TSLA'];
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const key=process.env.FINNHUB_API_KEY;
 if(!key)return res.status(503).json({error:'Market quote provider not configured. Simulation remains available.'});
 try{
  const data=await Promise.all(symbols.map(async symbol=>{
   const response=await fetch('https://finnhub.io/api/v1/quote?symbol='+symbol+'&token='+encodeURIComponent(key),{signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw Error('Quote provider unavailable');
   const quote=await response.json();
   const price=Number(quote.c),time=Number(quote.t);
   if(!Number.isFinite(price)||price<=0||!Number.isFinite(time)||time<=0)throw Error('Invalid quote');
   return {symbol,price,asOf:new Date(time*1000).toISOString()};
  }));
  return res.status(200).json({source:'Finnhub',quotes:data});
 }catch{return res.status(502).json({error:'Market quotes unavailable. Use simulation instead.'});}
}
