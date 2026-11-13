"use client";
import {useEffect,useState} from 'react';
import {supabase} from '@/lib/supabase/client';
export default function SlidePhoto({path,url,alt}:{path?:string;url?:string;alt:string}){
 const [preview,setPreview]=useState(''),[failed,setFailed]=useState(false);
 useEffect(()=>{if(!path||url)return;const controller=new AbortController();void(async()=>{try{const {data}=await supabase.auth.getSession();if(!data.session)throw Error('Sign in to preview');const response=await fetch('/api/live?photo='+encodeURIComponent(path),{headers:{Authorization:`Bearer ${data.session.access_token}`},cache:'no-store',signal:controller.signal});const result=await response.json();if(!response.ok)throw Error('Photo unavailable');if(!controller.signal.aborted)setPreview(result.imageUrl);}catch{if(!controller.signal.aborted)setFailed(true);}})();return()=>controller.abort();},[path,url]);
 if(failed)return <p className="live-photo-unavailable" role="status">Image unavailable. The quiz questions are still available.</p>;
 const source=url||preview;
 // Room photos are resized on upload; direct URLs preserve private signed-file access.
 // eslint-disable-next-line @next/next/no-img-element
 return <figure className="live-slide-photo">{source?<img src={source} alt={alt} width={2048} height={1152} onError={()=>setFailed(true)}/>:<span role="status">Loading image…</span>}</figure>;
}
