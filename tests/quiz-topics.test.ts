import {it,expect} from 'vitest';
import {lessons} from '../lib/education';
import {learningModules} from '../lib/billing/curriculum';
import {gamePacks,topicQuestions} from '../lib/games/content';
import {validateQuestions} from '../lib/games/authoring';
import {parseQuizDraft} from '../lib/games/draft';
it('includes every displayed module and every lesson with its original answer key',()=>{
 expect(gamePacks.filter(p=>p.kind==='module').map(p=>p.title)).toEqual(learningModules.map(m=>m.title));
 for(const lesson of lessons){expect(gamePacks.find(p=>p.id===`lesson:${lesson.id}`)?.moduleTitle).toBeTruthy();expect(topicQuestions(`lesson:${lesson.id}`)).toEqual([lesson.quiz]);}
 for(const [i,module] of learningModules.entries())expect(topicQuestions(String(i))).toEqual(lessons.filter(l=>module.ids.includes(l.id)).map(l=>l.quiz));
});
it('every topic produces a valid live quiz and can be saved and restored',()=>{
 for(const topic of gamePacks){const questions=topicQuestions(topic.id);expect(()=>validateQuestions(questions),topic.title).not.toThrow();expect(parseQuizDraft(JSON.stringify({version:1,title:'Quiz',pack:topic.id,seconds:45,questions})).pack).toBe(topic.id);}
 expect(()=>topicQuestions('lesson:999999')).toThrow();
});
