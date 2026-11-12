import {it,expect} from 'vitest';
import {budgetMonth,defaultBudgetConfig,isBudgetGame} from '../lib/education/budget';
import {initialState} from '../lib/trading';
import {isAccountState} from '../lib/storage/schema';
it('models a full year without changing the trading account or earning trading XP',()=>{
 const account=initialState(),before=structuredClone(account);const game={config:{...defaultBudgetConfig},decisions:[] as {save:number;repay:number;spend:number}[]};
 for(let i=0;i<12;i++){const result=budgetMonth(game);game.decisions.push({save:Math.min(100,result.cash),repay:0,spend:0});}
 const result=budgetMonth(game);expect(result.complete).toBe(true);expect(result.history).toHaveLength(12);expect(result.savings).toBe(1200);expect(result.debt).toBe(0);expect(isAccountState({...account,budgetGame:game})).toBe(true);expect(account).toEqual(before);
});
it('uses savings for shortfalls before borrowing and charges modeled monthly interest',()=>{
 const game={config:{initialCash:0,monthlyGross:0,taxRate:0,rent:100,essentials:0,apr:24},decisions:[{save:0,repay:0,spend:0}]};
 const result=budgetMonth(game);expect(result.cash).toBe(0);expect(result.interest).toBe(2);expect(result.debt).toBe(382);expect(result.history[0].debt).toBe(100);
});
it('rejects overspending, over-repayment, malformed saves and impossible histories',()=>{
 const game={config:defaultBudgetConfig,decisions:[{save:1e8,repay:0,spend:0}]};expect(isBudgetGame(game)).toBe(false);expect(isBudgetGame({config:defaultBudgetConfig,decisions:[{save:0,repay:1,spend:0}]})).toBe(false);expect(isBudgetGame({config:{...defaultBudgetConfig,taxRate:-1},decisions:[]})).toBe(false);expect(isAccountState({...initialState(),budgetGame:{config:defaultBudgetConfig,decisions:Array(13).fill({save:0,repay:0,spend:0})}})).toBe(false);expect(isAccountState(initialState())).toBe(true);
});
