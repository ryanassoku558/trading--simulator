import {it,expect} from 'vitest';
import {positionSize,hypotheticalProfit,volatility,moodWarning} from '../lib/trading/tools';
import {initialState,portfolio,resetSimulator} from '../lib/trading';
import {isAccountState} from '../lib/storage/schema';
import {earned,answerLesson,lessons} from '../lib/education';
it('sizes by planned risk and available cash, rejecting invalid long-position inputs',()=>{
 expect(positionSize(1000,1,100,98)).toEqual({shares:5,budget:10,plannedRisk:10,cost:500});
 expect(positionSize(1000,10,100,99)?.shares).toBe(10);
 expect(positionSize(50,1,100,98)?.shares).toBe(0);
 expect(positionSize(1e308,100,1e-100,5e-101)?.shares).toBe(1000000);
 for(const inputs of [[1000,1,100,100],[1000,1,100,101],[NaN,1,100,98],[1000,1,0,98],[1000,101,100,98]])expect(positionSize(...inputs as [number,number,number,number])).toBeNull();
 expect(hypotheticalProfit(5,100,104)).toBe(20);expect(hypotheticalProfit(5,100,98)).toBe(-10);
});
it('measures variability and prompts reflection only from recent reported moods',()=>{
 expect(volatility([100,100,100])).toBe(0);expect(volatility([100,101,100])).toBeGreaterThan(.9);
 expect(moodWarning([{mood:'Tilt'}])).toBe(true);
 expect(moodWarning([{mood:'Fear'},{mood:'Calm'}])).toBe(false);
 expect(moodWarning([{mood:'Fear'},{mood:'Greed'}])).toBe(true);
 expect(moodWarning([{mood:'Tilt'},{mood:'Calm'},{mood:'Calm'},{mood:'Calm'}])).toBe(false);
});
it('persists optional check-ins and goals, rejects malformed fields, and clears them on simulator reset',()=>{
 const s=initialState();s.moods=[{id:'one',date:new Date().toISOString(),mood:'Fear'}];s.returnGoal={startedAt:new Date().toISOString(),startingEquity:10000,targetPercent:20};
 expect(isAccountState(s)).toBe(true);
 expect(isAccountState({...s,moods:[{...s.moods[0],mood:'invalid'}]})).toBe(false);
 expect(isAccountState({...s,moods:[s.moods[0],s.moods[0]]})).toBe(false);
 expect(isAccountState({...s,returnGoal:{...s.returnGoal,targetPercent:Infinity}})).toBe(false);
 expect(resetSimulator(s).moods).toEqual([]);expect(resetSimulator(s).returnGoal).toBeUndefined();
});
it('excludes referral deposits from trading profits and returns',()=>{
 const s=initialState();s.cash=20000;s.referralDeposits=10000;
 expect(portfolio(s).gain).toBe(0);expect(portfolio(s).percent).toBe(0);
 s.cash=21000;expect(portfolio(s).gain).toBe(1000);expect(portfolio(s).percent).toBe(5);
 expect(isAccountState({...s,referralDeposits:-1})).toBe(false);expect(resetSimulator(s).referralDeposits).toBe(0);
});
it('unlocks risk and chart badges only after the corresponding complete modules',()=>{
 let s=initialState();expect(earned(s,'risk')).toBe(false);expect(earned(s,'chart')).toBe(false);
 for(const l of lessons.filter(l=>l.level===8))s=answerLesson(s,l.id,l.quiz.answer);
 expect(earned(s,'risk')).toBe(true);expect(earned(s,'chart')).toBe(false);
 for(const l of lessons.filter(l=>l.level===4||l.level===6))s=answerLesson(s,l.id,l.quiz.answer);
 expect(earned(s,'chart')).toBe(true);
});
