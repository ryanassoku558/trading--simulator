import {it,expect} from 'vitest';
import {expandedModules,expandedLessons} from '../lib/education/expanded';
import {lessons,levels,answerLesson,achievements,earned} from '../lib/education';
import {initialState} from '../lib/trading';
import {isAccountState} from '../lib/storage/schema';
it('adds trading and investing modules without changing the original lesson identities',()=>{
 expect(expandedModules).toHaveLength(25);expect(expandedLessons).toHaveLength(100);expect(lessons).toHaveLength(159);expect(levels).toHaveLength(45);
 expect(expandedModules.filter(m=>m.track==='Long-term investing')).toHaveLength(4);
 expect(lessons.find(l=>l.id===1)?.title).toBe('What is a stock?');expect(lessons.find(l=>l.id===55)?.title).toContain('Moving averages');
 expect(new Set(lessons.map(l=>l.id)).size).toBe(159);expect(new Set(expandedLessons.map(l=>l.title)).size).toBe(100);
 for(const l of expandedLessons){expect(l.explanation.length).toBeGreaterThan(200);expect(l.example.length).toBeGreaterThan(90);expect(l.why.length).toBeGreaterThan(30);expect(new Set(l.quiz.options).size).toBe(3);}
 expect(lessons.some(l=>l.id===60)).toBe(false);
});
it('awards module completion XP and mastery exactly once while preserving saved accounts',()=>{
 let s=initialState();const group=lessons.filter(l=>l.level===17);expect(earned(s,'module-17')).toBe(false);
 for(const l of group)s=answerLesson(s,l.id,l.quiz.answer);
 expect(s.learning.xp).toBe(240);expect(earned(s,'module-17')).toBe(true);expect(isAccountState(s)).toBe(true);
 expect(answerLesson(s,group[0].id,group[0].quiz.answer).learning.xp).toBe(240);
 expect(achievements.find(a=>a.id==='module-17')?.title).toBe('Asset Explorer');
 expect(earned(s,'module-999')).toBe(false);expect(earned(s,'curriculum')).toBe(false);
});
it('unlocks broad learning milestones from completed lessons rather than repeated attempts',()=>{
 let s=initialState();for(const l of lessons.slice(0,100))s=answerLesson(s,l.id,l.quiz.answer);
 expect(earned(s,'fifty')).toBe(true);expect(earned(s,'hundred')).toBe(true);expect(earned(s,'curriculum')).toBe(false);
 for(const l of lessons.slice(100))s=answerLesson(s,l.id,l.quiz.answer);expect(earned(s,'curriculum')).toBe(true);
});
