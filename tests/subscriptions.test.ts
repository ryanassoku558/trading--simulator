import {hasLiveStripeKey} from '@/lib/billing/checkout-availability';
import {it,expect} from 'vitest';
import {starterModules,starterLessonIds,canLearn,isProSubscription} from '@/lib/billing/access';
import {canWatchTutorial,freeTutorialSlugs} from '@/lib/billing/benefits';
import tutorials from '@/lib/education/tutorials.json';
import {learningModules} from '@/lib/billing/curriculum';
import {lessons} from '@/lib/education';
import {initialState,portfolio} from '@/lib/trading';
import {isAccountState} from '@/lib/storage/schema';
it('provides five Starter modules with exactly twenty distinct existing lessons',()=>{expect(starterModules.map(m=>m.title)).toEqual(['Market Basics','Candlesticks','Chart Patterns','Trend & Momentum','Volume & Volatility']);expect(starterLessonIds.length).toBe(20);expect(new Set(starterLessonIds).size).toBe(20);for(const id of starterLessonIds)expect(lessons.some(l=>l.id===id)).toBe(true);});
it('locks paid lessons and never derives Pro from a client profile',()=>{expect(canLearn(1,false)).toBe(true);expect(canLearn(151,false)).toBe(false);expect(canLearn(151,true)).toBe(true);expect(isProSubscription('active',null)).toBe(false);expect(isProSubscription('trialing','2999-01-01')).toBe(false);expect(isProSubscription('active','2020-01-01')).toBe(false);expect(isProSubscription('active','2999-01-01')).toBe(true);expect(isProSubscription('inactive','2999-01-01')).toBe(false);});
it('excludes recharges from trading profit and validates deposit data',()=>{const state={...initialState(),cash:15000,simulatorDeposits:5000};expect(portfolio(state).gain).toBe(0);expect(portfolio(state).percent).toBe(0);expect(isAccountState(state)).toBe(true);expect(isAccountState({...state,simulatorDeposits:-1})).toBe(false);});

it('lists every lesson once with the five free modules first',()=>{const ids=learningModules.flatMap(m=>m.ids);expect(ids.length).toBe(lessons.length);expect(new Set(ids).size).toBe(lessons.length);expect(learningModules.slice(0,5)).toEqual(starterModules);expect(learningModules.slice(5).every(m=>m.ids.every(id=>!canLearn(id,false)))).toBe(true);});

it('unlocks exactly the first five videos for Starter independently of lesson access',()=>{expect(freeTutorialSlugs).toEqual(tutorials.slice(0,5).map(t=>t.slug));for(const [index,video]of tutorials.entries()){expect(canWatchTutorial(video.slug,false)).toBe(index<5);expect(canWatchTutorial(video.slug,true)).toBe(true);}});

it("blocks public sandbox checkout and only recognizes live secret keys",()=>{expect(hasLiveStripeKey(undefined)).toBe(false);expect(hasLiveStripeKey("sk_test_example")).toBe(false);expect(hasLiveStripeKey("pk_live_example")).toBe(false);expect(hasLiveStripeKey("sk_live_example")).toBe(true);});
