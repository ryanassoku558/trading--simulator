import {it,expect} from 'vitest';
import {expandedModules,expandedLessons} from '../lib/education/expanded';
import {lessons,levels,answerLesson,achievements,earned} from '../lib/education';
import {initialState} from '../lib/trading';
import {isAccountState} from '../lib/storage/schema';
it('adds twenty-three complete modules without changing the original lesson identities',()=>{
 expect(expandedModules).toHaveLength(23);expect(expandedLessons).toHaveLength(92);expect(lessons).toHaveLength(151);expect(levels).toHaveLength(35);
 expect(expandedModules.filter(m=>m.track==='Personal finance')).toHaveLength(10);
 expect(lessons.find(l=>l.id===1)?.title).toBe('What is a stock?');expect(lessons.find(l=>l.id===55)?.title).toContain('Moving averages');
 expect(new Set(lessons.map(l=>l.id)).size).toBe(151);expect(new Set(expandedLessons.map(l=>l.title)).size).toBe(92);
 for(const l of expandedLessons){expect(l.explanation.length).toBeGreaterThan(200);expect(l.example.length).toBeGreaterThan(90);expect(l.why.length).toBeGreaterThan(30);expect(new Set(l.quiz.options).size).toBe(3);}
 expect(lessons.find(l=>l.id===60)?.explanation).toContain('no single amount');expect(lessons.find(l=>l.id===60)?.explanation).toContain('best time to begin learning is now');
});
it('awards module completion XP and mastery exactly once while preserving saved accounts',()=>{
 let s=initialState();const group=lessons.filter(l=>l.level===13);expect(earned(s,'module-13')).toBe(false);
 for(const l of group)s=answerLesson(s,l.id,l.quiz.answer);
 expect(s.learning.xp).toBe(240);expect(earned(s,'module-13')).toBe(true);expect(isAccountState(s)).toBe(true);
 expect(answerLesson(s,group[0].id,group[0].quiz.answer).learning.xp).toBe(240);
 expect(achievements.find(a=>a.id==='module-13')?.title).toBe('Financial Foundations');
 expect(earned(s,'module-999')).toBe(false);expect(earned(s,'curriculum')).toBe(false);
});
it('unlocks broad learning milestones from completed lessons rather than repeated attempts',()=>{
 let s=initialState();for(const l of lessons.slice(0,100))s=answerLesson(s,l.id,l.quiz.answer);
 expect(earned(s,'fifty')).toBe(true);expect(earned(s,'hundred')).toBe(true);expect(earned(s,'curriculum')).toBe(false);
 for(const l of lessons.slice(100))s=answerLesson(s,l.id,l.quiz.answer);expect(earned(s,'curriculum')).toBe(true);
});
