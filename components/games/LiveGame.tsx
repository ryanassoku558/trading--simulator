"use client";
import {useCallback,useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {supabase} from '@/lib/supabase/client';
import {gamePacks} from '@/lib/games/content';
interface Room {code:string;title:string;phase:'waiting'|'question'|'reveal'|'finished';isHost:boolean;index:number;total:number;seconds:number;endsAt:string|null;serverNow:string;answeredCount:number;players:{nickname:string;score:number;answered:boolean}[];question:{text:string;options:string[];answer?:number;explanation?:string}|null;self:{nickname:string;submitted:boolean;choice:number|null;correct?:boolean;points?:number}|null;}
async function liveRequest(body?:object,code?:string):Promise<Room & {code:string}>{
 const {data}=await supabase.auth.getSession();
 const response=await fetch(body?'/api/live':'/api/live?code='+encodeURIComponent(code||''),{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(data.session?{Authorization:`Bearer ${data.session.access_token}`}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});
 let result;try{result=await response.json();}catch{throw Error('The game service is temporarily unavailable. Please try again.');}if(!response.ok)throw Object.assign(Error(result.error||'Unable to reach the game.'),{status:response.status});return result;
}
export default function LiveGame({initialRoom='',onSignIn}:{initialRoom?:string;onSignIn:()=>void}){
 const router=useRouter();const [activeCode,setActiveCode]=useState(initialRoom),[code,setCode]=useState(initialRoom),[nickname,setNickname]=useState(''),[pack,setPack]=useState('0'),[seconds,setSeconds]=useState(45),[room,setRoom]=useState<Room|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[countdown,setCountdown]=useState(0),[copied,setCopied]=useState(false);
 const roomRef=useRef<Room|null>(null),offset=useRef(0),actionBusy=useRef(false);
 const accept=useCallback((next:Room)=>{if(roomRef.current?.code===next.code&&Date.parse(next.serverNow)<Date.parse(roomRef.current.serverNow))return;offset.current=Date.parse(next.serverNow)-Date.now();roomRef.current=next;setRoom(next);},[]);
 useEffect(()=>{
  if(!activeCode)return;let cancelled=false,timer:ReturnType<typeof setTimeout>;
  const poll=async()=>{try{const next=await liveRequest(undefined,activeCode);if(!cancelled){accept(next);setError('');}}catch(e){if(!cancelled){if(!actionBusy.current)setError(e instanceof Error?e.message:'Reconnecting…');if(!roomRef.current&&[403,404].includes((e as {status?:number}).status??0))setActiveCode('');}}finally{if(!cancelled)timer=setTimeout(poll,2000);}};
  void poll();return()=>{cancelled=true;clearTimeout(timer);};
 },[activeCode,accept]);
 useEffect(()=>{const tick=()=>{const current=roomRef.current;setCountdown(current?.phase==='question'&&current.endsAt?Math.max(0,Math.ceil((Date.parse(current.endsAt)-Date.now()-offset.current)/1000)):0);};tick();const timer=setInterval(tick,250);return()=>clearInterval(timer);},[]);
 async function action(action:string,extras:object={}){
  if(actionBusy.current)return;actionBusy.current=true;setBusy(true);setError('');
  try{const result=await liveRequest({action,code:activeCode||code.trim().toUpperCase(),index:room?.index??0,...extras});
   const nextCode=result.code;setActiveCode(nextCode);setCode(nextCode);if(activeCode!==nextCode)router.replace('/play?room='+nextCode,{scroll:false});accept(await liveRequest(undefined,nextCode));
  }catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{actionBusy.current=false;setBusy(false);}
 }
 function leave(){setActiveCode('');setRoom(null);roomRef.current=null;setError('');setCopied(false);router.replace('/play',{scroll:false});}
 return <section className="card live-game" aria-label="Live quiz game">
  <div className="card-heading"><div><span className="eyebrow">PLAY TOGETHER</span><h2>Live quiz</h2></div>{room&&<button className="secondary" disabled={busy} onClick={leave}>Leave room</button>}</div>
  {!room?<><p>One person hosts. Everyone else enters the room code and a nickname. No trading knowledge needed—start with Market Basics.</p><div className="live-entry-grid">
   <form onSubmit={e=>{e.preventDefault();void action('join',{nickname:nickname.trim()});}}><h3>Join a game</h3><label>Room code<input aria-label="Room code" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={6} minLength={6} pattern="[A-HJ-NP-Z2-9]{6}" required autoComplete="off" placeholder="ABC234"/></label><label>Your nickname<input aria-label="Your nickname" value={nickname} onChange={e=>setNickname(e.target.value)} maxLength={20} minLength={2} pattern="[A-Za-z0-9_ ]{2,20}" required autoComplete="off" placeholder="Choose a name for this game"/></label><button className="primary" disabled={busy}>{busy?'Joining…':'Join with code'}</button><p className="small">No account needed. Your nickname is visible in this room.</p></form>
   <form onSubmit={e=>{e.preventDefault();void action('create',{pack,seconds});}}><h3>Host a game</h3><p className="small">Every Sprout account can host. Sign in first, choose a topic, then share the room code.</p><button type="button" className="text-link" onClick={onSignIn}>Sign in or create an account</button><label>Quiz topic<select value={pack} onChange={e=>setPack(e.target.value)}>{gamePacks.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><label>Time per question<select value={seconds} onChange={e=>setSeconds(Number(e.target.value))}>{[30,45,60].map(s=><option key={s} value={s}>{s} seconds</option>)}</select></label><button className="secondary" disabled={busy}>Create a live room</button><p className="small">5 questions · up to 50 players · rooms expire after 2 hours</p></form>
  </div></>:<>
   <div className="live-room-heading"><div><span className="eyebrow">{room.title}</span><h3>Room <strong>{room.code}</strong></h3></div><div><strong>{room.players.length} player{room.players.length===1?'':'s'}</strong><button className="text-link" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.origin+'/play?room='+room.code);setCopied(true);}catch{setError('Share the room code shown above.');}}}>{copied?'Invite copied':'Copy invite link'}</button></div></div>
   {room.phase==='waiting'&&<><h3>{room.isHost?'Your room is ready. Invite your players.':'You’re in! Wait for the host to start.'}</h3><p>Open Sprout → Play & study → Live quiz, then enter <strong>{room.code}</strong>. The host starts when everyone is ready.</p><div className="live-player-list">{room.players.length?room.players.map(p=><span key={p.nickname}>{p.nickname}</span>):<p>No players yet. Share the code to invite someone.</p>}</div>{room.isHost&&<button className="primary" disabled={busy||room.players.length===0} onClick={()=>void action('start')}>Start five-question game</button>}</>}
   {(room.phase==='question'||room.phase==='reveal')&&room.question&&<>
    <div className="live-question-heading"><strong>Question {room.index+1} of {room.total}</strong><span role="timer" aria-label="Time remaining">{room.phase==='question'?`${countdown}s remaining`:'Answer revealed'}</span></div>
    <progress max={room.total} value={room.index+1} aria-label="Live game progress"/>
    <h3 className="live-question-text">{room.question.text}</h3>
    <div className="live-answer-grid">{room.question.options.map((option,i)=><button key={i} className={`live-answer answer-${i} ${room.self?.choice===i?'chosen':''} ${room.phase==='reveal'&&room.question?.answer===i?'correct-answer':''}`} disabled={busy||room.isHost||room.phase!=='question'||!!room.self?.submitted||countdown===0} onClick={()=>void action('answer',{choice:i})}><span>{String.fromCharCode(65+i)}</span>{option}{room.phase==='reveal'&&room.question?.answer===i?' ✓':''}</button>)}</div>
    {room.phase==='question'&&<p role="status">{room.self?.submitted?'Answer saved. Wait for the reveal.':room.isHost?'Players are answering. Answers stay hidden until reveal.':'Choose one answer. It’s final for this question.'} · {room.answeredCount}/{room.players.length} answered</p>}
    {room.phase==='reveal'&&<div className="live-reveal"><h3>{room.self?room.self.submitted?(room.self.correct?'Correct—nice work!':'A useful one to review.'):'Time’s up. Let’s learn the answer.':'Let’s review the answer.'}</h3><p>{room.question.explanation}</p>{room.self?.submitted&&<p>{room.self.points} points this question</p>}</div>}
    {room.isHost&&<div className="presentation-actions">{room.phase==='question'?<button className="primary" disabled={busy} onClick={()=>void action('reveal')}>Reveal answer</button>:<button className="primary" disabled={busy} onClick={()=>void action('next')}>{room.index+1===room.total?'Show final results':'Next question'}</button>}</div>}
   </>}
   {room.phase==='finished'&&<><h3>Game complete! Everyone learned something.</h3><p>Correct answers earn 1,000 points, with up to 200 extra for time remaining. Game points are separate from lesson XP.</p><Link className="primary" href="/learn?lesson=1">Keep learning →</Link></>}
   {room.phase!=='waiting'&&<section className="live-scoreboard" aria-label="Game leaderboard"><h3>{room.phase==='finished'?'Final leaderboard':'Leaderboard'}</h3><ol>{room.players.map((p,i)=><li key={p.nickname} className={room.self?.nickname===p.nickname?'you':''}><span>{i+1}. {p.nickname}{room.self?.nickname===p.nickname?' (you)':''}</span><strong>{p.score.toLocaleString()} points</strong></li>)}</ol></section>}
   {room.isHost&&room.phase!=='finished'&&<button className="text-link" disabled={busy} onClick={()=>{if(window.confirm('End this game for everyone?'))void action('end');}}>End this game</button>}
  </>}
  {error&&<p role="alert" className="error">{error}</p>}
 </section>;
}
