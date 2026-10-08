import type {Achievement,State} from '@/types';
type GrowthMilestone=Achievement & {term:'Medium-term'|'Long-term';target:number;reward:string};
const milestoneTracks: {kind:string;label:string;verb:string;targets:number[];names:string[]}[]=[
 {kind:'lessons',label:'Knowledge',verb:'Complete {n} different lessons.',targets:[10,15,40,60,75,90,120,160],names:['Curious Learner','Building Blocks','Growing Understanding','Knowledge Explorer','Broad Perspective','Flourishing Mind','Deep Understanding','Curriculum Trailblazer']},
 {kind:'days',label:'Commitment',verb:'Study on {n} different days. Breaks do not erase your progress.',targets:[7,14,30,45,90,120,180,270,365,730],names:['Showing Up','Finding Your Rhythm','Monthly Learner','Steady Roots','Quarter of Growth','Committed Learner','Half-Year Journey','Enduring Focus','Year of Learning','Two-Year Legacy']},
 {kind:'streak',label:'Consistency',verb:'Pass knowledge checks on {n} consecutive days.',targets:[7,10,21,45,60,120,180,365],names:['Seven-Day Spark','Ten-Day Focus','Three-Week Rhythm','Consistent Growth','Two-Month Focus','Seasoned Routine','Half-Year Rhythm','Year of Consistency']},
 {kind:'journal',label:'Reflection',verb:'Write meaningful reflections for {n} different practice trades. Take your time; there is no deadline.',targets:[3,5,15,20,30,75,100,150],names:['First Reflections','Learning From Decisions','Reflective Roots','Thoughtful Habits','Reflection Routine','Journal Scholar','Century of Reflection','Reflective Legacy']},
 {kind:'risk',label:'Planning',verb:'Document positive initial risk and meaningful reflections for {n} different practice trades. There is no deadline.',targets:[3,10,15,20,40,50,75,100],names:['Planning Foundations','Risk Journal Builder','Intentional Practice','Planning Routine','Risk Researcher','Fifty Thoughtful Plans','Planning Scholar','Century of Planning']},
 {kind:'mood',label:'Self-awareness',verb:'Record your mood on {n} different days.',targets:[3,7,21,30,60,90],names:['Notice Your Mindset','Mindset Check-In','Self-Awareness Rhythm','Mindful Month','Emotional Perspective','Mindful Season']},
];
const extendedMilestones:GrowthMilestone[]=milestoneTracks.flatMap(track=>track.targets.map((target,i)=>({id:`growth-${track.kind}-${target}`,title:track.names[i],description:track.verb.replace('{n}',String(target)),term:(track.kind==='lessons'?target>=90:target>=30)?'Long-term':'Medium-term',target,reward:`${track.names[i]} title · ${track.label.toLowerCase()} badge`})));
export const growthMilestones: GrowthMilestone[]=[
 {id:'growth-lessons-25',title:'Knowledge Builder',description:'Complete 25 different lessons.',term:'Medium-term',target:25,reward:'Knowledge Builder title'},
 {id:'growth-streak-14',title:'Two-Week Rhythm',description:'Pass knowledge checks on 14 consecutive days.',term:'Medium-term',target:14,reward:'Silver consistency badge'},
 {id:'growth-days-20',title:'Steady Student',description:'Study on 20 different days, without needing an unbroken streak.',term:'Medium-term',target:20,reward:'Steady Student title'},
 {id:'growth-journal-10',title:'Thoughtful Reviewer',description:'Write meaningful journal reflections for 10 different trades.',term:'Medium-term',target:10,reward:'Silver reflection badge'},
 {id:'growth-risk-5',title:'Risk-Aware Planner',description:'Record a positive initial risk and a meaningful reflection for 5 different trades.',term:'Medium-term',target:5,reward:'Risk-Aware Planner title'},
 {id:'growth-mood-14',title:'Mindful Practice',description:'Check in with your mood on 14 different days.',term:'Medium-term',target:14,reward:'Silver self-awareness badge'},
 {id:'growth-lessons-150',title:'Deep Roots',description:'Complete 150 different lessons.',term:'Long-term',target:150,reward:'Gold knowledge badge'},
 {id:'growth-streak-30',title:'Month of Momentum',description:'Pass knowledge checks on 30 consecutive days.',term:'Long-term',target:30,reward:'Gold consistency badge'},
 {id:'growth-streak-90',title:'Season of Learning',description:'Pass knowledge checks on 90 consecutive days.',term:'Long-term',target:90,reward:'Season of Learning title'},
 {id:'growth-days-60',title:'Lasting Commitment',description:'Study on 60 different days. Breaks do not erase this milestone.',term:'Long-term',target:60,reward:'Lasting Commitment title'},
 {id:'growth-journal-50',title:'Reflective Practitioner',description:'Write meaningful journal reflections for 50 different trades.',term:'Long-term',target:50,reward:'Gold reflection badge'},
 {id:'growth-risk-25',title:'Deliberate Decision Maker',description:'Document initial risk and a meaningful reflection for 25 different trades.',term:'Long-term',target:25,reward:'Gold planning badge'},
 ...extendedMilestones,
];
export function milestoneProgress(s:State,id:string){
 const milestone=growthMilestones.find(m=>m.id===id);if(!milestone)return null;
 const kind=id.split('-')[1];const tradeIds=new Set(s.trades.map(t=>t.id));
 const journals=(s.journal??[]).filter(j=>tradeIds.has(j.tradeId)&&j.note.trim().length>=20);
 const days=(dates:string[])=>new Set(dates.map(d=>d.slice(0,10)).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d))).size;
 const value=kind==='lessons'?new Set(s.learning.completed).size:kind==='streak'?s.learning.streak:kind==='days'?days(s.learning.attempts.map(a=>a.date)):kind==='mood'?days((s.moods??[]).map(m=>m.date)):new Set(journals.filter(j=>kind!=='risk'||(Number.isFinite(j.initialRisk)&&j.initialRisk!>0)).map(j=>j.tradeId)).size;
 return {value:Math.min(value,milestone.target),target:milestone.target,earned:value>=milestone.target};
}
