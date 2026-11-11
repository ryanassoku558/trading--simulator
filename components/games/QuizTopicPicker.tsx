"use client";
import {useId,useState} from 'react';
import {gamePacks} from '@/lib/games/content';
export default function QuizTopicPicker({value,onChange,label='Quiz topic'}:{value:string;onChange:(value:string)=>void;label?:string}){
 const [search,setSearch]=useState('');const searchId=useId();
 const query=search.trim().toLowerCase(),filtered=gamePacks.filter(p=>`${p.title} ${p.moduleTitle}`.toLowerCase().includes(query));
 const selected=gamePacks.find(p=>p.id===value),selectedHidden=selected&&!filtered.some(p=>p.id===value);
 return <div className="quiz-topic-picker"><label htmlFor={searchId}>Find a module or lesson</label><input id={searchId} type="search" placeholder="Search the full curriculum" value={search} onChange={e=>setSearch(e.target.value)}/><label>{label}<select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{selectedHidden&&<optgroup label="Current selection"><option value={selected.id}>{selected.title}</option></optgroup>}{(['module','lesson'] as const).map(kind=><optgroup key={kind} label={kind==='module'?'Modules':'Lessons'}>{filtered.filter(p=>p.kind===kind).map(p=><option key={p.id} value={p.id}>{p.kind==='lesson'?`${p.moduleTitle} — ${p.title}`:p.title}</option>)}</optgroup>)}</select></label><p className="small">{query?`${filtered.length} matching topics`:`${gamePacks.filter(p=>p.kind==='module').length} modules · ${gamePacks.filter(p=>p.kind==='lesson').length} lessons`}{query&&filtered.length===0?' — try another search. Your current selection is kept.':''}</p></div>;
}
