import {describe,it,expect} from 'vitest';
import {extractMetrics} from '../lib/research/sec';
import {GET} from '../app/api/research/route';
const row=(val:number,end:string,start?:string,filed='2025-11-01',form='10-K')=>({val,end,start,filed,form,accn:'0000000001-25-000001'});
describe('SEC reported financial normalization',()=>{
 it('uses full annual periods, never quarterly revenue or non-finite facts',()=>{
  const result=extractMetrics({facts:{'us-gaap':{Revenues:{units:{USD:[row(100,'2024-12-31','2024-01-01'),row(30,'2025-03-31','2025-01-01','2025-05-01','10-Q'),row(Infinity,'2025-12-31','2025-01-01')]}},Assets:{units:{USD:[row(200,'2025-03-31',undefined,'2025-05-01','10-Q')]}}}}});
  expect(result.metrics.find(m=>m.key==='revenue')?.value).toBe(100);expect(result.metrics.find(m=>m.key==='assets')?.value).toBe(200);expect(result.metrics.some(m=>m.key==='eps')).toBe(false);
 });
 it('chooses newer periods across concepts and deduplicates annual amendments',()=>{
  const result=extractMetrics({facts:{'us-gaap':{RevenueFromContractWithCustomerExcludingAssessedTax:{units:{USD:[row(90,'2023-12-31','2023-01-01')]}},Revenues:{units:{USD:[row(100,'2024-12-31','2024-01-01','2025-02-01'),row(110,'2024-12-31','2024-01-01','2025-03-01','10-K/A')]}}}}});
  expect(result.metrics[0].value).toBe(110);expect(result.revenueHistory.map(m=>m.value)).toEqual([90,110]);
 });
 it('does not turn absent, unsupported-currency or IFRS facts into zero',()=>{expect(extractMetrics({facts:{'ifrs-full':{Revenue:{units:{EUR:[row(100,'2024-12-31','2024-01-01')]}}}}}).metrics).toEqual([]);});
 it('rejects invalid symbols before contacting a provider',async()=>{for(const symbol of ['https://evil.test','../x','AAPL?foo=x','']){const r=await GET(new Request(`https://sprout.test/api/research?symbol=${encodeURIComponent(symbol)}`));expect(r.status).toBe(400);}});
});

import {investmentHistory,quote,marketEpoch} from '../lib/market';
it('multi-year line charts use deterministic generated prices with dated endpoints',()=>{
 for(const years of [1,5,10] as const){const points=investmentHistory('AAPL',years,1000);expect(points).toHaveLength(121);expect(points.every(p=>Number.isFinite(p.price)&&p.price>0)).toBe(true);expect(points.at(-1)?.price).toBe(quote('AAPL',1000).price);expect(points.at(-1)?.date).toBe(new Date(marketEpoch+2000000).toISOString().slice(0,10));expect(Date.parse(points.at(-1)!.date)-Date.parse(points[0].date)).toBeGreaterThan((years*365-1)*86400000);expect(investmentHistory('AAPL',years,1000)).toEqual(points);}
});
