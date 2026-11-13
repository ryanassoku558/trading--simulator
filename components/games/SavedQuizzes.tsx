"use client";
import {useEffect,useRef,useState} from 'react';
import {supabase} from '@/lib/supabase/client';
interface SavedQuiz{code:string;title:string;phase:string;isOpen?:boolean;total:number;seconds:number}
export default function SavedQuizzes({onOpen,onSignIn,onEdit}:{onOpen:(code:string)=>void;onSignIn:()=>void;onEdit:(code:string)=>void}){
 const [quizzes,setQuizzes]=useState<SavedQuiz[]>([]),[signedIn,setSignedIn]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const request=useRef({id:0});
 async function load(token?:string){
  const id=++request.current.id;setSignedIn(!!token);setQuizzes([]);setError('');
  if(!token){setLoading(false);return;}setLoading(true);
  try{const response=await fetch('/api/live?saved=1',{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load saved quizzes.');if(id===request.current.id)setQuizzes(data.quizzes);}
  catch(e){if(id===request.current.id)setError(e instanceof Error?e.message:'Unable to load saved quizzes.');}
  finally{if(id===request.current.id)setLoading(false);}
 }
 useEffect(()=>{let active=true;const sequence=request.current;void supabase.auth.getSession().then(({data})=>{if(active)void load(data.session?.access_token);});const {data}=supabase.auth.onAuthStateChange((_event,session)=>{if(active)void load(session?.access_token);});return()=>{active=false;sequence.id++;data.subscription.unsubscribe();};},[]);
 if(!signedIn&&!loading)return null;
 return <section className="live-saved-quizzes" aria-label="Saved quizzes"><div className="card-heading"><div><span className="eyebrow">READY WHEN YOU ARE</span><h3>Saved quizzes</h3></div>{signedIn&&<button className="secondary" disabled={loading} onClick={async()=>{const {data}=await supabase.auth.getSession();void load(data.session?.access_token);}}>Refresh saved quizzes</button>}</div><p>Create a room once, then keep its QR code in your PowerPoint. Your questions, room code and link stay saved. Open the quiz here and activate it when you’re ready for people to join.</p>
  {loading?<p role="status">Loading your quizzes…</p>:!signedIn?<button className="text-link" onClick={onSignIn}>Sign in to view your saved quizzes</button>:error?<p role="alert" className="error">{error}</p>:quizzes.length?<ul>{quizzes.map(q=><li key={q.code}><div><strong>{q.title}</strong><span>{q.total} questions · {q.seconds}s per question · {q.phase==='waiting'?(q.isOpen?'Active — players can join':'Saved — activate when ready'):q.phase==='finished'?'Completed — ready to reuse':'Session in progress'}</span><small>Permanent room code: {q.code}</small></div><div className="live-saved-actions"><button className="secondary" disabled={q.isOpen||!['waiting','finished'].includes(q.phase)} onClick={()=>onEdit(q.code)} aria-label={`Edit saved quiz ${q.title}`} title={q.isOpen||!['waiting','finished'].includes(q.phase)?'Finish the active session before editing':'Edit questions and settings'}>Edit quiz</button><button className="primary" onClick={()=>onOpen(q.code)} aria-label={`Open saved quiz ${q.title}`}>Open quiz →</button></div></li>)}</ul>:<p>No saved quizzes yet. Create a live room below to save your first quiz.</p>}
 </section>;
}
