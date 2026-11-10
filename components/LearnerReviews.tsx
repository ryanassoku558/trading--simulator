"use client";
import {useCallback,useEffect,useState} from "react";
import {Star,MessageSquareQuote} from "lucide-react";
import {communityStatus} from "@/lib/community/status";
import {supabase} from "@/lib/supabase/client";
import {useAccount} from "@/lib/storage/useAccount";
interface Review {user_id:string;author:string;rating:number;body:string;updated_at:string;}
export default function LearnerReviews(){
 const {user,state,pending}=useAccount();
 const [ownReview,setOwnReview]=useState<Review|null>(null);
 const [reviews,setReviews]=useState<Review[]>([]),[ready,setReady]=useState(false),[rating,setRating]=useState("5"),[body,setBody]=useState(""),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const load=useCallback(async()=>{if(!(await communityStatus()).reviews){setReady(false);return;}const {data,error}=await supabase.from("learner_reviews").select("user_id,author,rating,body,updated_at").order("updated_at",{ascending:false}).limit(6);if(!error){setReady(true);setReviews(data as Review[]);if(user){const own=await supabase.from("learner_reviews").select("user_id,author,rating,body,updated_at").eq("user_id",user.id).maybeSingle();setOwnReview(own.error?null:own.data as Review|null);}else setOwnReview(null);}else setReady(false);},[user]);
 useEffect(()=>{let active=true;void Promise.resolve().then(()=>{if(active)return load();});return()=>{active=false;};},[load]);
 const existing=ownReview??reviews.find(r=>r.user_id===user?.id);
 async function save(){
  if(!user||!state||!consent||body.trim().length<10||busy||pending)return;
  setBusy(true);setMessage("");
  const {error}=await supabase.from("learner_reviews").upsert({user_id:user.id,author:state.profile.name.trim().slice(0,60)||"Sprout learner",rating:Number(rating),body:body.trim(),consent:true,updated_at:new Date().toISOString()});
  setBusy(false);if(error)setMessage("Your review was not published. Please try again.");else{setMessage("Thank you! Your review is published.");setBody("");setConsent(false);await load();}
 }
 async function remove(){if(!user||busy)return;setBusy(true);const {error}=await supabase.from("learner_reviews").delete().eq("user_id",user.id);setBusy(false);if(error)setMessage("Your review could not be removed.");else{setMessage("Your review was removed.");await load();}}
 return <section className="learner-reviews" id="reviews"><div className="section-intro"><div><span className="eyebrow">REAL EXPERIENCES. SHARED BY LEARNERS.</span><h2>How is your Sprout journey going?</h2><p>Tell us what helped you learn and what could be better.</p></div><MessageSquareQuote size={30}/></div>
  {reviews.length>0?<div className="review-grid">{reviews.map(r=><figure className="review-card" key={r.user_id}><div className="review-stars" aria-label={`${r.rating} out of 5 stars`}>{Array.from({length:5},(_,i)=><Star key={i} size={16} fill={i<r.rating?"currentColor":"none"}/>)}</div><blockquote>{r.body}</blockquote><figcaption><span className="review-avatar" data-tone={r.author.charCodeAt(0)%9} aria-hidden="true">{r.author.split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0]).join("").toUpperCase()}</span><div><strong>{r.author}</strong><span>Sprout member · {new Date(r.updated_at).toLocaleDateString()}</span></div></figcaption></figure>)}</div>:<div className="reviews-empty"><MessageSquareQuote size={24}/><p>No published reviews yet. Your experience can help the next learner find their starting point.</p></div>}
  <div className="review-form card"><h3>Leave a review</h3><p className="small">Share your own experience. Your profile name and review will be public; your email stays private. One review per account.</p>
  {!ready&&<p className="small">Reviews are opening soon. Please check back to publish your experience.</p>}
  {!user&&<p><a className="text-link" href="#account">Sign in or create an account</a> to publish a review.</p>}
  <form onSubmit={e=>{e.preventDefault();void save();}}><label>Your rating<select aria-label="Review rating" value={rating} onChange={e=>setRating(e.target.value)}>{[5,4,3,2,1].map(n=><option value={n} key={n}>{n} {n===1?"star":"stars"}</option>)}</select></label><label>Your experience<textarea aria-label="Your Sprout review" rows={4} minLength={10} maxLength={1500} value={body} onChange={e=>setBody(e.target.value)} placeholder="Which lesson or practice feature helped? What would you improve?"/></label><label className="review-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>This is my own experience, and I agree to publish my profile name and review.</label><div className="hero-buttons"><button className="primary" type="submit" disabled={!ready||!user||busy||pending||!consent||body.trim().length<10}>Publish my review</button>{existing&&<><button type="button" className="secondary" onClick={()=>{setBody(existing.body);setRating(String(existing.rating));setConsent(false);}}>Edit my review</button><button type="button" className="text-link" disabled={busy} onClick={()=>void remove()}>Remove my review</button></>}</div>{message&&<p role="status">{message}</p>}</form></div>
 </section>;
}
