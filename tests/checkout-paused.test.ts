import {expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({entitlement:vi.fn(),stripe:vi.fn()}));
vi.mock('@/lib/billing/server',()=>({checkoutReady:()=>false,billingReady:()=>true,...mocks,failure:(error:Error,status=400)=>Response.json({error:error.message},{status})}));
import {POST} from '@/app/api/billing/checkout/route';
import {GET} from '@/app/api/billing/status/route';
it('reports coming soon for configured sandbox billing',async()=>{const data=await(await GET(new Request('https://sprout-trading.vercel.app/api/billing/status'))).json();expect(data).toEqual({pro:false,ready:false});});
it('blocks direct checkout attempts before account lookup or Stripe session creation',async()=>{const response=await POST(new Request('https://sprout-trading.vercel.app/api/billing/checkout',{method:'POST'}));expect(response.status).toBe(503);expect((await response.json()).error).toContain('not available');expect(mocks.entitlement).not.toHaveBeenCalled();expect(mocks.stripe).not.toHaveBeenCalled();});
