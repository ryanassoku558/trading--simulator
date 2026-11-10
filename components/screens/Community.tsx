"use client";
import {useCallback,useEffect,useState} from "react";
import type {User} from "@supabase/supabase-js";
import type {State} from "@/types";
import {communityStatus} from "@/lib/community/status";
import {supabase} from "@/lib/supabase/client";
import {portfolio} from "@/lib/trading";
import {money} from "@/lib/market";
import {challengeProgress} from "@/lib/education/challenges";
import {useSubscription} from "../Subscription";
import LearnerReviews from "../LearnerReviews";
import ChartMarkup,{type Mark,isMark} from "../ChartMarkup";
import {MessagesSquare,Flag,ThumbsUp,Trash2,Trophy,ArrowUpRight} from "lucide-react";
import Link from "next/link";
interface Post {id:string;user_id:string;author:string;kind:string;title:string;body:string;markup:Mark[];created_at:string;}
interface Reply {id:string;user_id:string;author:string;body:string;created_at:string;}
interface PortfolioEntry {user_id:string;author:string;equity:number;updated_at:string;}
interface Score {user_id:string;author:string;challenge:string;score:number;}
export default function Community({state,user}:{state:State;user:User|null}){
 const {pro,upgrade}=useSubscription();
 const [tab,setTab]=useState("discussion"),[posts,setPosts]=useState<Post[]>([]),[scores,setScores]=useState<Score[]>([]),[votes,setVotes]=useState<Record<string,number>>({});
 const [portfolios,setPortfolios]=useState<PortfolioEntry[]>([]);
 const [ready,setReady]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const [title,setTitle]=useState(""),[body,setBody]=useState(""),[marks,setMarks]=useState<Mark[]>([]),[selected,setSelected]=useState<Post|null>(null),[replies,setReplies]=useState<Reply[]>([]),[reply,setReply]=useState("");
 const draftKey=`sprout-community-draft-${user?.id??"guest"}`;
 const author=state.profile.name.trim().slice(0,60)||"Sprout learner";
 const load=useCallback(async()=>{
  if(!(await communityStatus()).community){setReady(false);setLoading(false);return;}
  const result=await supabase.from("community_posts").select("*").eq("kind",tab==="leaderboard"?"discussion":tab).order("created_at",{ascending:false}).limit(50);
  if(result.error){setReady(false);setLoading(false);if(!["PGRST205","42P01"].includes(result.error.code))setMessage("The community could not load. Please try again.");return;}
  setReady(true);setPosts(result.data as Post[]);
  const [ranked,counts,balances]=await Promise.all([supabase.from("community_scores").select("user_id,author,challenge,score").order("score",{ascending:false}).order("updated_at").limit(100),supabase.from("community_vote_counts").select("post_id,votes").in("post_id",result.data.map(p=>p.id)),supabase.from("community_portfolios").select("user_id,author,equity,updated_at").order("equity",{ascending:false}).limit(100)]);
  if(!balances.error)setPortfolios(balances.data as PortfolioEntry[]);
  if(!ranked.error)setScores(ranked.data as Score[]);
  if(!counts.error)setVotes(Object.fromEntries(counts.data.map(c=>[c.post_id,c.votes])));
  setLoading(false);
 },[tab]);
 useEffect(()=>{let active=true;void Promise.resolve().then(()=>{if(active)return load();});return()=>{active=false;};},[load]);
 async function publish(){
  if(!user||!ready||!title.trim()||!body.trim()||busy)return;
  setBusy(true);setMessage("");
  const {error}=await supabase.from("community_posts").insert({user_id:user.id,author,kind:tab,title:title.trim(),body:body.trim(),markup:tab==="chart"?marks:[]});
  setBusy(false);
  if(error){setMessage("Your post was not published. Please try again.");return;}
  setTitle("");setBody("");setMarks([]);setMessage("Published to the community.");await load();
 }
 async function open(post:Post){setSelected(post);setReply("");setReplies([]);const result=await supabase.from("community_replies").select("*").eq("post_id",post.id).order("created_at").limit(50);if(!result.error)setReplies(result.data as Reply[]);else setMessage("Replies could not load.");}
 async function sendReply(){if(!user||!selected||!reply.trim()||busy)return;setBusy(true);const {error}=await supabase.from("community_replies").insert({post_id:selected.id,user_id:user.id,author,body:reply.trim()});setBusy(false);if(error)setMessage("Your reply was not published.");else await open(selected);}
 async function vote(post:Post){if(!user||busy)return;setBusy(true);const {error}=await supabase.from("community_votes").insert({post_id:post.id,user_id:user.id});setBusy(false);if(error)setMessage(error.code==="23505"?"You already voted for this chart.":"Your vote could not be saved.");else{setMessage("Vote saved.");await load();}}
 async function remove(post:Post){if(!user||user.id!==post.user_id||busy)return;setBusy(true);const {error}=await supabase.from("community_posts").delete().eq("id",post.id).eq("user_id",user.id);setBusy(false);if(error)setMessage("Your post could not be deleted.");else{setSelected(null);await load();}}
 async function report(post:Post){if(!user||busy)return;setBusy(true);const {error}=await supabase.from("community_reports").insert({post_id:post.id,user_id:user.id,reason:"Requested review of community content"});setBusy(false);setMessage(error?(error.code==="23505"?"You already reported this post.":"The report could not be saved."):"Report submitted for review.");}
 async function shareScore(){if(!pro){upgrade("Community challenges");return;}if(!user||!state.challenge||busy)return;setBusy(true);const {error}=await supabase.from("community_scores").upsert({user_id:user.id,challenge:state.challenge.id,author,score:challengeProgress(state),updated_at:new Date().toISOString()});setBusy(false);if(error)setMessage("Challenge progress could not be shared.");else{setMessage("Your learning progress was shared.");await load();}}
 async function sharePortfolio(){if(!user||busy)return;setBusy(true);const {error}=await supabase.from("community_portfolios").upsert({user_id:user.id,author,equity:portfolio(state).value,updated_at:new Date().toISOString()});setBusy(false);if(error)setMessage("Your portfolio snapshot could not be shared.");else{setMessage("Your virtual portfolio value was shared.");await load();}}
 async function removePortfolio(){if(!user||busy)return;setBusy(true);const {error}=await supabase.from("community_portfolios").delete().eq("user_id",user.id);setBusy(false);if(error)setMessage("Your snapshot could not be removed.");else{setMessage("Your portfolio snapshot was removed.");await load();}}
 function saveDraft(){try{localStorage.setItem(draftKey,JSON.stringify({title,body,marks}));setMessage("Draft saved on this browser. It has not been shared.");}catch{setMessage("Your browser could not save the draft.");}}
 function restoreDraft(){try{const d=JSON.parse(localStorage.getItem(draftKey)??"null");if(d&&typeof d.title==="string"&&typeof d.body==="string"){setTitle(d.title.slice(0,140));setBody(d.body.slice(0,4000));setMarks(Array.isArray(d.marks)?d.marks.filter(isMark).slice(0,20):[]);setMessage("Draft restored.");}else setMessage("No saved draft yet.");}catch{setMessage("Your draft could not be restored.");}}
 return <><div className="page-heading"><div><span className="eyebrow">LEARN TOGETHER. GROW TOGETHER.</span><h1>The Sprout community</h1><p>Connect with fellow learners through questions, strategy discussions, chart sharing, reviews, and virtual portfolio leaderboards.</p></div><MessagesSquare size={34}/></div>
  <div className="community-welcome"><div><span className="eyebrow">A COMMUNITY FOR CURIOUS MINDS</span><h2>You don’t have to figure it out alone.</h2><p>Share the reasoning, not a promise of returns. Keep posts respectful and never share private account details.</p></div><Link className="secondary" href="/practice">Take a practice challenge <ArrowUpRight size={16}/></Link></div>
  <div className="chart-type-buttons community-tabs" role="group" aria-label="Community category">{[["discussion","Discussions"],["strategy","Strategy sharing"],["chart","Chart competition"],["leaderboard","Leaderboards"]].map(([id,label])=><button key={id} aria-pressed={tab===id} className={tab===id?"active":""} onClick={()=>{if((id==="challenges"||id==="chart")&&!pro){upgrade("Community challenges");return;}setTab(id);setLoading(true);setSelected(null);setMessage("");}}>{label}</button>)}</div>
  {message&&<p className="community-status" role="status">{message}</p>}
  {loading?<p role="status">Loading the community…</p>:!ready&&<div className="community-coming"><Trophy size={25}/><div><h3>The community is opening soon.</h3><p>Try the chart challenge or save a strategy draft while shared boards are being prepared.</p></div><button className="secondary" onClick={()=>void load()}>Check again</button></div>}
  {!user&&<p className="small community-signin"><a className="text-link" href="#account">Sign in</a> to publish, reply, vote, or share challenge progress. Anyone can explore public posts.</p>}
  {tab==="leaderboard"?<section className="card"><div className="card-heading"><div><h2>Community leaderboards</h2><p>Ranked by journal reviews, not financial returns. Progress is shared by learners and is not independently verified.</p></div><Trophy size={24}/></div><section className="portfolio-leaderboard"><h3>Virtual portfolio value</h3><p className="small">User-shared snapshots, not independently verified. Everyone starts with $10,000 virtual cash; balances include cash and current simulated holdings. This ranking is not a measure of skill or future returns.</p><div className="hero-buttons"><button className="primary" disabled={!user||!ready||busy} onClick={()=>void sharePortfolio()}>Share my portfolio amount</button>{portfolios.some(p=>p.user_id===user?.id)&&<button className="secondary" disabled={busy} onClick={()=>void removePortfolio()}>Remove my portfolio snapshot</button>}</div>{portfolios.length?<div className="table-scroll"><table aria-label="Virtual portfolio leaderboard"><thead><tr><th>Rank</th><th>Learner</th><th>Virtual equity</th><th>Updated</th></tr></thead><tbody>{portfolios.map((p,i)=><tr key={p.user_id}><td>{i+1}</td><td>{p.author}</td><td>{money(Number(p.equity))}</td><td>{new Date(p.updated_at).toLocaleString()}</td></tr>)}</tbody></table></div>:<p>No portfolio snapshots yet. Sharing is optional.</p>}</section><h3>Journal challenge progress</h3><button className="primary" disabled={!user||!ready||!state.challenge||busy} onClick={()=>void shareScore()}>Share my challenge progress</button>{!state.challenge&&<p className="small">Start a challenge in the Practice Lab first.</p>}{["plan-3","seven-days"].map(id=><div key={id} className="leaderboard"><h3>{id==="plan-3"?"Three-trade review":"Seven days of reflection"}</h3>{scores.filter(s=>s.challenge===id).length?<ol>{scores.filter(s=>s.challenge===id).map(s=><li key={s.user_id}><strong>{s.author}</strong><span>{s.score} / {id==="plan-3"?3:7} reviewed</span></li>)}</ol>:<p>No entries yet. Be the first to share your learning progress.</p>}</div>)}</section>:<>
   <section className="card community-compose"><h2>{tab==="chart"?"Chart challenge: mark a level and define risk":tab==="strategy"?"Share a thoughtful strategy":"Start a discussion"}</h2><p>{tab==="chart"?"Annotate this example chart, explain your levels, and describe what would invalidate your idea. Vote for clear reasoning, not predicted profits.":"A useful post explains the idea, its assumptions, and possible risks."}</p>{tab==="chart"&&<><ChartMarkup marks={marks} onChange={setMarks}/><small>Drag to draw a line, or use the annotation buttons. All chart values are illustrative.</small></>}
    <label>Title<input aria-label="Community post title" maxLength={140} value={title} onChange={e=>setTitle(e.target.value)} placeholder="What would you like to discuss?"/></label><label>Your explanation<textarea aria-label="Community post body" maxLength={4000} rows={4} value={body} onChange={e=>setBody(e.target.value)} placeholder="Share what you noticed and the questions you still have."/></label><div className="hero-buttons"><button className="primary" disabled={!ready||!user||busy||!title.trim()||!body.trim()} onClick={()=>void publish()}>Publish {tab==="chart"?"chart":"post"}</button><button className="secondary" onClick={saveDraft}>Save private draft</button><button className="secondary" onClick={restoreDraft}>Restore draft</button></div>
   </section>
   <section className="community-feed"><h2>{tab==="chart"?"Community chart submissions":"Latest community posts"}</h2>{posts.length?posts.map(post=><article className="card community-post" key={post.id}><div className="community-author"><span className="avatar">{post.author.slice(0,1).toUpperCase()}</span><div><strong>{post.author}</strong><small>{new Date(post.created_at).toLocaleDateString()}</small></div></div><h3>{post.title}</h3><p>{post.body}</p>{post.kind==="chart"&&<ChartMarkup marks={Array.isArray(post.markup)?post.markup.filter(isMark):[]}/>}<div className="hero-buttons"><button className="secondary" onClick={()=>void open(post)}>Open discussion</button>{post.kind==="chart"&&<button className="secondary" disabled={!user||busy} onClick={()=>void vote(post)}><ThumbsUp size={15}/>{votes[post.id]??0} votes</button>}{user?.id===post.user_id?<button className="text-link" disabled={busy} onClick={()=>void remove(post)}><Trash2 size={15}/>Delete my post</button>:user&&<button className="text-link" disabled={busy} onClick={()=>void report(post)}><Flag size={15}/>Report</button>}</div></article>):<div className="card"><h3>Room for the first conversation.</h3><p>{ready?"No posts in this category yet. Share a thoughtful question or example.":"Shared posts will appear here when the community opens."}</p></div>}</section>
   {selected&&<section className="card community-thread"><h2>Replies: {selected.title}</h2>{replies.map(r=><div className="community-reply" key={r.id}><strong>{r.author}</strong><p>{r.body}</p></div>)}{!replies.length&&<p>No replies yet.</p>}<label>Your reply<textarea aria-label="Community reply" value={reply} maxLength={2000} rows={3} onChange={e=>setReply(e.target.value)}/></label><button className="primary" disabled={!user||busy||!reply.trim()} onClick={()=>void sendReply()}>Post reply</button></section>}
  </>}
 <LearnerReviews/>
 </>;
}
