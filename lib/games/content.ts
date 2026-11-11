import {lessons} from '@/lib/education';
import {learningModules} from '@/lib/billing/curriculum';
import {presentationQuestions} from '@/lib/education/presentation';
import {glossary} from '@/lib/education/discovery';
export const gamePacks=[
 ...learningModules.map((m,i)=>({id:String(i),title:m.title,kind:'module' as const,moduleTitle:m.title,lessonIds:m.ids})),
 ...lessons.map(l=>({id:`lesson:${l.id}`,title:l.title,kind:'lesson' as const,moduleTitle:learningModules.find(m=>m.ids.includes(l.id))?.title??'',lessonIds:[l.id]})),
];
export function topicLessons(pack:string){const topic=gamePacks.find(p=>p.id===pack);if(!topic)throw Error('Choose a quiz topic.');return lessons.filter(l=>topic.lessonIds.includes(l.id));}
// Live rooms can include every actual lesson quiz in a module, or one lesson quiz.
export function topicQuestions(pack:string){return topicLessons(pack).map(l=>({...l.quiz,options:[...l.quiz.options]}));}
// Solo quests remain five questions, using the curriculum's existing presentation flow.
export function gameQuestions(pack:string){return presentationQuestions(topicLessons(pack)).map(q=>({question:q.question,options:q.options,answer:q.answer,explanation:q.explanation}));}
const basicWords=/stock|share|portfolio|cash|broker|diversif|market order|limit order|risk|return|buy|sell/i;
const wordOrder=['Stock','Share','Broker','Portfolio','Diversification','Market order','Limit order'];
export const beginnerTerms=glossary.filter(t=>basicWords.test(t[0])).sort((a,b)=>(wordOrder.includes(a[0])?wordOrder.indexOf(a[0]):99)-(wordOrder.includes(b[0])?wordOrder.indexOf(b[0]):99)).slice(0,12);
export function shuffle<T>(items:readonly T[]):T[]{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
