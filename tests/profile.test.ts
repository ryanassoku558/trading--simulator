import {avatarIds} from '@/lib/avatars';
import {it,expect} from 'vitest';
import {initialState} from '@/lib/trading';
import {profileInsights} from '@/lib/profile';
import {isAccountState} from '@/lib/storage/schema';
it('accepts old accounts and validates new profile fields',()=>{const s=initialState();expect(isAccountState(s)).toBe(true);for(const avatar of avatarIds)expect(isAccountState({...s,profile:{...s.profile,avatar}})).toBe(true);expect(isAccountState({...s,profile:{...s.profile,avatar:'unknown'}})).toBe(false);expect(isAccountState({...s,profile:{...s.profile,bio:'hello',avatar:'leaf',handle:'sprout_user',timezone:'UTC'}})).toBe(true);expect(isAccountState({...s,profile:{...s.profile,bio:'a'.repeat(241)}})).toBe(false);expect(isAccountState({...s,learning:{...s.learning,quizPasses:-1}})).toBe(false);});
it('new accounts do not show invented performance and growth follows Sprouty',()=>{const s=initialState();expect(profileInsights(s).risk).toBeNull();expect(profileInsights(s).level).toBe(1);s.learning.completed=Array.from({length:30},(_,i)=>i+1);expect(profileInsights(s).level).toBe(4);});

it('validates photo persistence and rejects unsafe or oversized data',()=>{const s=initialState();const profile=(photo:unknown)=>({...s,profile:{...s.profile,photo}});expect(isAccountState(profile('data:image/jpeg;base64,/9j/AA=='))).toBe(true);expect(isAccountState(profile('https://example.com/photo.jpg'))).toBe(false);expect(isAccountState(profile('data:image/svg+xml;base64,AA=='))).toBe(false);expect(isAccountState(profile('data:image/jpeg;base64,'+'A'.repeat(140000)))).toBe(false);});
