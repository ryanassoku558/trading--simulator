"use client";
import {useRef,useState} from 'react';
import {ImagePlus,Check} from 'lucide-react';
import {supabase} from '@/lib/supabase/client';
export default function BackgroundPicker({path,onChange,onBusy}:{path?:string;onChange:(path?:string)=>void;onBusy:(busy:boolean)=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[preview,setPreview]=useState('');
 const input=useRef<HTMLInputElement>(null);
 async function upload(file:File){
  setError('');setBusy(true);onBusy(true);
  try{
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('Choose a JPEG, PNG or WebP photo smaller than 5 MB.');
   const {data}=await supabase.auth.getSession();if(!data.session)throw Error('Sign in before adding a background.');
   const bitmap=await createImageBitmap(file);
   const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   const ctx=canvas.getContext('2d');if(!ctx){bitmap.close();throw Error('Photo editing is unavailable in this browser.');}
   ctx.fillStyle='#103c2d';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
   let image=canvas.toDataURL('image/jpeg',.8);if(image.length>1_060_000)image=canvas.toDataURL('image/jpeg',.55);
   if(image.length>1_060_000)throw Error('Choose a smaller or simpler photo.');
   const response=await fetch('/api/live',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({action:'upload-background',image})});
   const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to upload this photo.');
   onChange(result.backgroundPath);setPreview(image);
  }catch(e){setError(e instanceof Error?e.message:'Unable to open this photo.');}finally{setBusy(false);onBusy(false);if(input.current)input.current.value='';}
 }
 return <fieldset className="live-background-picker"><legend>Make the room yours</legend><p className="small">Sprout’s forest background is included. Add your own photo to share with everyone in the room.</p>
  <div className={`live-background-sample ${preview?'has-photo':''}`} style={preview?{backgroundImage:`linear-gradient(120deg,#082c22aa,#082c2288),url(${JSON.stringify(preview)})`}:undefined}><span><ImagePlus size={24}/>{path?'Your background is ready':'Sprout · Grow together'}</span><b>Clear questions. Shared discoveries.</b></div>
  <label className="live-background-upload">{busy?'Uploading photo…':'Upload background photo'}<input ref={input} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);}}/></label>
  {path&&<div className="live-background-saved"><span><Check size={16}/> Photo saved for your next game</span><button type="button" className="text-link" disabled={busy} onClick={()=>{onChange(undefined);setPreview('');}}>Use Sprout background</button></div>}
  <p className="small">JPEG, PNG or WebP · up to 5 MB. Use a photo you have permission to share. Photos are dimmed behind the game for readability.</p>{error&&<p role="alert" className="error">{error}</p>}
 </fieldset>;
}
