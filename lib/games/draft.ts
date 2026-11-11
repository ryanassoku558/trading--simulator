import {gamePacks} from './content';
import type {LiveQuestion} from './authoring';
export const quizDraftKey='sprout-live-draft-v1';
export const quizUploadLimit=2*1024*1024;
export const quizTimers=[5,10,15,20,30,45,60,90,120,240];
export interface QuizDraft {version:1;title:string;pack:string;seconds:number;questions:LiveQuestion[]}
export function emptyQuestion():LiveQuestion{return {question:'',options:['','','',''],answer:0,explanation:''};}
// Drafts may be incomplete, but restored browser data must still have a valid shape.
export function parseQuizDraft(text:string):QuizDraft{
 if(new TextEncoder().encode(text).length>quizUploadLimit)throw Error('The saved quiz is too large.');
 const d=JSON.parse(text);
 if(!d||d.version!==1||typeof d.title!=='string'||d.title.length>80||typeof d.pack!=='string'||!gamePacks.some(p=>p.id===d.pack)||!quizTimers.includes(d.seconds)||!Array.isArray(d.questions)||!d.questions.length)throw Error('This saved draft cannot be opened.');
 const questions=d.questions.map((q:LiveQuestion)=>{
  if(!q||typeof q.question!=='string'||q.question.length>300||typeof q.explanation!=='string'||q.explanation.length>600||!Array.isArray(q.options)||q.options.length<2||q.options.length>4||q.options.some(o=>typeof o!=='string'||o.length>150)||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)throw Error('This saved draft cannot be opened.');
  return {question:q.question,options:[...q.options],answer:q.answer,explanation:q.explanation};
 });
 return {version:1,title:d.title,pack:d.pack,seconds:d.seconds,questions};
}
