import {describe,it,expect} from 'vitest';
import {lessons,levels} from '@/lib/education';
import {initialState} from '@/lib/trading';
import {presentationQuestions,completePresentation,recordPresentationAttempts} from '@/lib/education/presentation';
describe('presentation quizzes',()=>{
 it('every lesson and module has exactly five valid questions',()=>{for(const group of [...lessons.map(l=>[l]),...levels.map((_,i)=>lessons.filter(l=>l.level===i+1))]){const q=presentationQuestions(group);expect(q).toHaveLength(5);q.forEach(q=>expect(q.options[q.answer]).toBeTruthy());}});
 it('finishing a module awards its lessons and module bonus exactly once',()=>{const group=lessons.filter(l=>l.level===13);const completed=completePresentation(initialState(),group);expect(completed.learning.completed).toEqual(group.map(l=>l.id));expect(completed.learning.xp).toBe(240);expect(completePresentation(completed,group).learning.xp).toBe(240);});
 it('records actual missed answers without awarding a failed attempt',()=>{const s=initialState(),group=lessons.filter(l=>l.level===34);const failed=recordPresentationAttempts(s,s,group,[false,false,true,false,false]);expect(failed.learning.completed).toEqual([]);expect(failed.learning.xp).toBe(0);expect(failed.learning.attempts.filter(a=>a.correct)).toHaveLength(1);const passed=completePresentation(s,group,[false,true,true,true,true]);expect(passed.learning.attempts.filter(a=>!a.correct)).toHaveLength(1);});
 it('chart quizzes include a decision scenario',()=>expect(presentationQuestions(lessons.filter(l=>l.level===34)).some(q=>q.visual)).toBe(true));
});
