import type {Lesson,Quiz,State} from '@/types';
import {answerLesson} from './index';
export interface PresentationQuestion extends Quiz {lessonId:number;visual?:boolean;}
export function presentationQuestions(group:Lesson[]):PresentationQuestion[]{
 const questions:PresentationQuestion[]=group.map(l=>({...l.quiz,lessonId:l.id}));
 if(group.some(l=>[4,6,12,34].includes(l.level))) questions.push({lessonId:group[0].id,visual:true,question:'Price has risen toward resistance. You have no defined risk limit. What is the most disciplined next step?',options:['Buy immediately because the last candle is green','Define an entry, invalidation point, and affordable risk; waiting is an option','Put all available cash into the position'],answer:1,explanation:'A rising chart does not guarantee a breakout. Plan the decision and potential loss first; choosing no trade is valid.'});
 if(questions.length<1||questions.length>25)throw Error('Presentations require 1–25 questions.');
 return questions;
}
export function completePresentation(state:State,group:Lesson[],answers?:boolean[]):State{const next=group.reduce((next,l)=>answerLesson(next,l.id,l.quiz.answer),state);return answers?recordPresentationAttempts(state,next,group,answers):next;}
export function recordPresentationAttempts(previous:State,next:State,group:Lesson[],answers:boolean[]):State{const questions=presentationQuestions(group);return {...next,learning:{...next.learning,attempts:[...previous.learning.attempts,...questions.map((q,i)=>({lessonId:q.lessonId,correct:answers[i]===true,date:new Date().toISOString()}))]}};}
