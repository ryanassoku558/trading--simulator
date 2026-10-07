import type {Lesson,Quiz,State} from '@/types';
import {answerLesson} from './index';
import {moduleScenario} from './scenarios';
export type LearningMode="beginner"|"intermediate"|"advanced";
export function learningMode(state:State):LearningMode{return state.profile.learningMode??(state.profile.experience==="experienced"?"advanced":state.profile.experience==="basics"?"intermediate":"beginner");}
export interface PresentationQuestion extends Quiz {lessonId:number;visual?:boolean;}
export function presentationQuestions(group:Lesson[],mode:LearningMode="beginner"):PresentationQuestion[]{
 if(!group.length)throw Error('A presentation needs lesson content.');
 const first=group[0],scenario={...moduleScenario(first.level),lessonId:first.id};
 const calibration:PresentationQuestion={lessonId:first.id,question:'A worked example matches its assumptions. Which conclusion is supported?',options:['The same result is guaranteed in every real situation','The example explains a concept; real outcomes depend on assumptions and circumstances','Understanding one example means no further research is needed'],answer:1,explanation:'Worked examples teach reasoning under stated assumptions, not a promise about every real situation.'};
 const base:PresentationQuestion[]=group.length===1?[{...first.quiz,lessonId:first.id},{lessonId:first.id,question:`Which worked example illustrates “${first.title}”?`,options:['The result is certain regardless of assumptions.',first.example,'The concept does not need any context.'],answer:1,explanation:first.example},{lessonId:first.id,question:'Why does this idea matter in practice?',options:['It removes every possible uncertainty.',first.why,'It makes a written plan unnecessary.'],answer:1,explanation:first.why},calibration,scenario]:[];
 const questions:PresentationQuestion[]=group.slice(0,4).map(l=>({...l.quiz,lessonId:l.id}));
 while(questions.length<4)questions.push({...calibration,question:questions.length===3?'What is a sensible way to apply a lesson example?':calibration.question});
 questions.push(scenario);
 const selected=group.length===1?base:questions;
 if(mode==='beginner')return selected;
 const primary=group[0];
 const application:PresentationQuestion={lessonId:primary.id,question:`You are applying “${primary.title}” to a situation with different inputs. What is the strongest approach?`,options:['Reuse the example’s result because the topic has the same name','Recheck the inputs, assumptions, applicable rules, and possible consequences','Choose the interpretation that best supports your preferred result'],answer:1,explanation:`${primary.why} Examples illustrate reasoning under stated assumptions; changing those assumptions can change the outcome.`};
 const verification:PresentationQuestion={lessonId:primary.id,question:'Two explanations use different dates, assumptions, or account rules and reach different conclusions. How should you resolve the difference?',options:['Average the conclusions without reconciling the inputs','Trace the sources and assumptions, compare like-for-like, and state what remains uncertain','Use the more confident explanation as the deciding factor'],answer:1,explanation:'Resolve the factual inputs and applicable context before comparing conclusions. Confidence alone is not evidence.'};
 if(mode==='intermediate')return [selected[0],selected[1],selected[2],application,scenario];
 return [selected[0],{...scenario,question:`Advanced scenario: ${scenario.question}`,options:[scenario.options[0],scenario.options[1],scenario.options[2],'Keep the original assumptions unchanged and rely on a recent favorable outcome']},application,verification,{lessonId:primary.id,question:`Which explanation best justifies the practical importance of “${primary.title}”?`,options:['A recent successful example is enough to establish the rule',primary.why,'The topic can be evaluated independently of changing inputs, product rules, and circumstances'],answer:1,explanation:primary.why}];
}
export function completePresentation(state:State,group:Lesson[],answers?:boolean[],mode:LearningMode="beginner"):State{const next=group.reduce((next,l)=>answerLesson(next,l.id,l.quiz.answer),state);return answers?recordPresentationAttempts(state,next,group,answers,mode):next;}
export function recordPresentationAttempts(previous:State,next:State,group:Lesson[],answers:boolean[],mode:LearningMode="beginner"):State{const questions=presentationQuestions(group,mode);return {...next,learning:{...next.learning,attempts:[...previous.learning.attempts,...questions.map((q,i)=>({lessonId:q.lessonId,correct:answers[i]===true,date:new Date().toISOString()}))]}};}
