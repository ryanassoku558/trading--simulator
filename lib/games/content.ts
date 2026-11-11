import {lessons} from '@/lib/education';
import {starterModules} from '@/lib/billing/access';
import {presentationQuestions} from '@/lib/education/presentation';
import {glossary} from '@/lib/education/discovery';
export const gamePacks=starterModules.map((m,i)=>({id:String(i),title:m.title,description:`Five questions about ${m.title.toLowerCase()}.`}));
export function gameQuestions(pack:string){const module=starterModules[Number(pack)];if(!module||!/^\d$/.test(pack))throw Error('Choose a quiz topic.');return presentationQuestions(lessons.filter(l=>module.ids.includes(l.id))).map(q=>({question:q.question,options:q.options,answer:q.answer,explanation:q.explanation}));}
const basicWords=/stock|share|portfolio|cash|broker|diversif|market order|limit order|risk|return|buy|sell/i;
const wordOrder=['Stock','Share','Broker','Portfolio','Diversification','Market order','Limit order'];
export const beginnerTerms=glossary.filter(t=>basicWords.test(t[0])).sort((a,b)=>(wordOrder.includes(a[0])?wordOrder.indexOf(a[0]):99)-(wordOrder.includes(b[0])?wordOrder.indexOf(b[0]):99)).slice(0,12);
export function shuffle<T>(items:readonly T[]):T[]{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
