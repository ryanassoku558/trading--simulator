import { billingReady, entitlement, failure } from '@/lib/billing/server';
export async function GET(request: Request) {
  if (!billingReady()) return Response.json({ pro: false, ready: false }, { headers: { 'Cache-Control': 'no-store' } });
  if(!request.headers.get("authorization")?.match(/^Bearer .+/)) return Response.json({pro:false,ready:true},{headers:{"Cache-Control":"no-store"}});
  try { const {pro, subscription} = await entitlement(request); return Response.json({pro, ready:true, expires:subscription?.expires_at, cancelAtPeriodEnd:subscription?.cancel_at_period_end}, {headers:{'Cache-Control':'no-store'}}); } catch(error) { return failure(error,401); }
}
