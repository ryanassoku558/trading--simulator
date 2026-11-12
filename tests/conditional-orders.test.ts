import {it,expect} from 'vitest';
import {initialState,executeTrade,placeConditional,placeLimit,advanceMarket} from '../lib/trading';
import {quote} from '../lib/market';
import {isAccountState} from '../lib/storage/schema';
it('stop market uses the opposite limit trigger and fills at observed price rather than the trigger',()=>{
 const buy=advanceMarket(placeConditional(initialState(),'AAPL','buy',1,'stop',1),1);expect(buy.filled).toHaveLength(1);expect(buy.filled[0].price).toBe(quote('AAPL',1).price);expect(buy.filled[0].price).not.toBe(1);
 const owned=executeTrade(initialState(),'AAPL','buy',1).state;const sell=advanceMarket(placeConditional(owned,'AAPL','sell',1,'stop',999),2);expect(sell.filled[0].side).toBe('sell');expect(isAccountState(sell.state)).toBe(true);
});
it('tracks favorable sell prices, never lowers the trailing anchor and triggers on a later decline',()=>{
 const current=quote('AAPL',0).price;let highTick=1;while(highTick<10000&&quote('AAPL',highTick).price<current+1)highTick++;expect(highTick).toBeLessThan(10000);
 const high=quote('AAPL',highTick).price;let lowerTick=highTick+1;while(lowerTick<20000&&quote('AAPL',lowerTick).price>high-.5)lowerTick++;expect(lowerTick).toBeLessThan(20000);
 let s=placeConditional(executeTrade(initialState(),'AAPL','buy',1).state,'AAPL','sell',1,'trailing-stop',.5);s=advanceMarket(s,highTick).state;expect(s.orders[0].anchor).toBe(high);expect(s.orders[0].status).toBe('pending');expect(isAccountState(s)).toBe(true);const result=advanceMarket(s,lowerTick);expect(result.filled).toHaveLength(1);expect(result.state.orders[0].anchor).toBe(high);expect(result.filled[0].price).toBe(quote('AAPL',lowerTick).price);
});
it('expires before checking fills and cancels a triggered order without funding',()=>{
 const timed=placeConditional(initialState(),'AAPL','buy',1,'stop',1,true);const expired=advanceMarket(timed,43200);expect(expired.filled).toHaveLength(0);expect(expired.state.orders[0].reason).toMatch(/expired/);
 const poor={...initialState(),cash:1};const canceled=advanceMarket(placeConditional(poor,'AAPL','buy',1,'stop',1),1);expect(canceled.filled).toHaveLength(0);expect(canceled.state.cash).toBe(1);expect(canceled.state.orders[0].reason).toMatch(/Insufficient/);
});
it('preserves legacy limit semantics and rejects malformed saved trailing orders',()=>{
 const old=placeLimit(initialState(),'AAPL','buy',1,1000);expect(isAccountState(old)).toBe(true);expect(advanceMarket(old,1).filled).toHaveLength(1);expect(()=>placeConditional(initialState(),'AAPL','sell',1,'stop',100)).toThrow(/own/);const trail=placeConditional(initialState(),'AAPL','buy',1,'trailing-stop',1);expect(isAccountState(trail)).toBe(true);expect(isAccountState({...trail,orders:[{...trail.orders[0],anchor:undefined}]})).toBe(false);
});
import {tradesCsv} from '../lib/trading/export';
it('exports only this saved account with simulation labels and safely escaped journal text',()=>{const s=executeTrade(initialState(),'AAPL','buy',1).state;s.journal=[{tradeId:s.trades[0].id,note:'=HYPERLINK("bad")',emotion:'Calm'}];const csv=tradesCsv(s);expect(csv).toContain('SIMULATED');expect(csv).toContain("'=HYPERLINK(\"\"bad\"\")");expect(csv).toContain('Recorded initial risk USD');expect(csv.split('\r\n')).toHaveLength(2);});
