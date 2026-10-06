import {expect,it} from "vitest";
import {initialState,executeTrade,resetSimulator} from "../lib/trading";
import {performance} from "../lib/trading/analytics";
import {challengeProgress} from "../lib/education/challenges";
import {isAccountState} from "../lib/storage/schema";
it("handles empty analytics and excludes breakeven from win rate",()=>{
 let s=initialState();expect(performance(s).winRate).toBeNull();
 s=executeTrade(s,"AAPL","buy",2).state;
 s=executeTrade(s,"AAPL","sell",1).state;
 expect(performance(s).breakeven).toBe(1);
 expect(performance(s).winRate).toBeNull();
});
it("calculates win rate, recorded R, and peak-to-trough sampled drawdown",()=>{
 const s=initialState();
 const trade={id:"win",date:new Date().toISOString(),ticker:"AAPL",side:"sell" as const,shares:1,price:110,total:110,realized:20,portfolioValue:10000};
 s.trades=[trade,{...trade,id:"loss",realized:-10},{...trade,id:"flat",realized:0}];
 s.journal=[{tradeId:"win",note:"Planned risk",emotion:"Calm",initialRisk:10},{tradeId:"loss",note:"Review",emotion:"Calm",initialRisk:20}];
 s.snapshots=[{date:"start",value:10000},{date:"peak",value:12000},{date:"trough",value:9000}];
 const a=performance(s);expect(a.winRate).toBe(50);expect(a.averageR).toBe(.75);expect(a.maxDrawdown).toBe(25);expect(a.realized).toBe(10);
});
it("validates journal extensions while preserving old accounts and clearing reset data",()=>{
 const s=initialState();expect(isAccountState(s)).toBe(true);
 s.journal=[{tradeId:"a",note:"Review",emotion:"Calm",initialRisk:20}];
 s.challenge={id:"plan-3",startedAt:new Date().toISOString(),startingEquity:10000,startTradeCount:0};
 expect(isAccountState(s)).toBe(true);
 expect(isAccountState({...s,journal:[{...s.journal[0],initialRisk:-1}]})).toBe(false);
 expect(isAccountState({...s,challenge:{...s.challenge,id:"unknown"}})).toBe(false);
 expect(resetSimulator(s).journal).toEqual([]);expect(resetSimulator(s).challenge).toBeUndefined();
});
it("counts only journaled trades made after a challenge starts",()=>{
 let s=executeTrade(initialState(),"AAPL","buy",1).state;
 s.challenge={id:"plan-3",startedAt:new Date().toISOString(),startingEquity:10000,startTradeCount:1};
 s.journal=[{tradeId:s.trades[0].id,note:"Existing review",emotion:"Calm"}];
 expect(challengeProgress(s)).toBe(0);
 s=executeTrade(s,"AAPL","sell",1).state;
 s.journal!.push({tradeId:s.trades[0].id,note:"New review",emotion:"Calm"});
 expect(challengeProgress(s)).toBe(1);
 s.challenge!.id="seven-days";expect(challengeProgress(s)).toBe(1);
});
