import type {Lesson,Quiz,State} from '@/types';
import {answerLesson} from './index';
import {moduleScenario} from './scenarios';
export interface PresentationQuestion extends Quiz {lessonId:number;visual?:boolean;}
export function presentationQuestions(group:Lesson[]):PresentationQuestion[]{
 if(!group.length)throw Error('A presentation needs lesson content.');
 const first=group[0],scenario={...moduleScenario(first.level),lessonId:first.id};
 const calibration:PresentationQuestion={lessonId:first.id,question:'A worked example matches its assumptions. Which conclusion is supported?',options:['The same result is guaranteed in every real situation','The example explains a concept; real outcomes depend on assumptions and circumstances','Understanding one example means no further research is needed'],answer:1,explanation:'Worked examples teach reasoning under stated assumptions, not a promise about every real situation.'};
 const base:PresentationQuestion[]=group.length===1?[{...first.quiz,lessonId:first.id},{lessonId:first.id,question:`Which worked example illustrates “${first.title}”?`,options:['The result is certain regardless of assumptions.',first.example,'The concept does not need any context.'],answer:1,explanation:first.example},{lessonId:first.id,question:'Why does this idea matter in practice?',options:['It removes every possible uncertainty.',first.why,'It makes a written plan unnecessary.'],answer:1,explanation:first.why},calibration,scenario]:[];
 const questions:PresentationQuestion[]=group.slice(0,4).map(l=>({...l.quiz,lessonId:l.id}));
 while(questions.length<4)questions.push({...calibration,question:questions.length===3?'What is a sensible way to apply a lesson example?':calibration.question});
 questions.push(scenario);
 const selected=group.length===1?base:questions;
 return selected;
}
export function completePresentation(state:State,group:Lesson[],answers?:boolean[]):State{const next=group.reduce((next,l)=>answerLesson(next,l.id,l.quiz.answer),state);return answers?recordPresentationAttempts(state,next,group,answers):next;}
export function recordPresentationAttempts(previous:State,next:State,group:Lesson[],answers:boolean[]):State{const questions=presentationQuestions(group);return {...next,learning:{...next.learning,attempts:[...previous.learning.attempts,...questions.map((q,i)=>({lessonId:q.lessonId,correct:answers[i]===true,date:new Date().toISOString()}))]}};}
