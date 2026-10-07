import {it,expect} from 'vitest';
import {starterModules,starterLessonIds,canLearn,isProSubscription} from '@/lib/billing/access';
import {lessons} from '@/lib/education';
import {initialState,portfolio} from '@/lib/trading';
import {isAccountState} from '@/lib/storage/schema';
it('provides five Starter modules with exactly twenty distinct existing lessons',()=>{expect(starterModules.map(m=>m.title)).toEqual(['Market Basics','Candlesticks','Chart Patterns','Trend & Momentum','Volume & Volatility']);expect(starterLessonIds.length).toBe(20);expect(new Set(starterLessonIds).size).toBe(20);for(const id of starterLessonIds)expect(lessons.some(l=>l.id===id)).toBe(true);});
it('locks paid lessons and never derives Pro from a client profile',()=>{expect(canLearn(1,false)).toBe(true);expect(canLearn(151,false)).toBe(false);expect(canLearn(151,true)).toBe(true);expect(isProSubscription('active',null)).toBe(false);expect(isProSubscription('trialing','2999-01-01')).toBe(false);expect(isProSubscription('active','2020-01-01')).toBe(false);expect(isProSubscription('active','2999-01-01')).toBe(true);expect(isProSubscription('inactive','2999-01-01')).toBe(false);});
it('excludes recharges from trading profit and validates deposit data',()=>{const state={...initialState(),cash:15000,simulatorDeposits:5000};expect(portfolio(state).gain).toBe(0);expect(portfolio(state).percent).toBe(0);expect(isAccountState(state)).toBe(true);expect(isAccountState({...state,simulatorDeposits:-1})).toBe(false);});
