"use client";
import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from 'react';
import {supabase} from '@/lib/supabase/client';
import {useAccount} from '@/lib/storage/useAccount';
import type {ClassroomOverview} from '@/lib/classroom/types';
export async function classroomRequest<T=any>(body?:object,query=''):Promise<T>{const {data}=await supabase.auth.getSession();if(!data.session)throw Error('Sign in to open your classroom.');const response=await fetch('/api/classroom'+query,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${data.session.access_token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});let result;try{result=await response.json();}catch{throw Error('The classroom service is temporarily unavailable. Please try again.');}if(!response.ok)throw Error(result.error||'Unable to open your classroom.');return result;}
const Context=createContext<{userId:string;overview:ClassroomOverview|null;loading:boolean;error:string;refresh:()=>Promise<void>;act:(action:string,body?:object)=>Promise<any>}>({userId:'',overview:null,loading:false,error:'',refresh:async()=>{},act:async()=>{throw Error('Sign in to open your classroom.');}});
export const useClassroom=()=>useContext(Context);
export default function ClassroomProvider({children}:{children:ReactNode}){const {user,state,pending}=useAccount(),userId=user?.id??'',current=useRef(userId);current.current=userId;const [snapshot,setSnapshot]=useState<{userId:string;data:ClassroomOverview|null;loading:boolean;error:string}>({userId:'',data:null,loading:false,error:''});const refreshing=useRef('');
 const previousUser=useRef('');
 useEffect(()=>{const old=previousUser.current;previousUser.current=userId;if(!old||old===userId)return;try{for(let i=sessionStorage.length-1;i>=0;i--){const key=sessionStorage.key(i);if(key?.startsWith(`sprout-mission:${old}:`))sessionStorage.removeItem(key);}}catch{}},[userId]);
 const refresh=useCallback(async()=>{if(!userId||refreshing.current===userId)return;refreshing.current=userId;try{const data=await classroomRequest<ClassroomOverview>();if(current.current===userId)setSnapshot({userId,data,loading:false,error:''});}catch(e){if(current.current===userId)setSnapshot(old=>({userId,data:old.userId===userId?old.data:null,loading:false,error:e instanceof Error?e.message:'Unable to refresh your classroom.'}));}finally{if(refreshing.current===userId)refreshing.current='';}},[userId]);
 const act=useCallback(async(action:string,body:object={})=>{const result=await classroomRequest({action,...body});if(current.current===userId)await refresh();return result;},[refresh,userId]);
 const overview=snapshot.userId===userId?snapshot.data:null;
 const assignmentIds=overview?.assignments.map(row=>row.assignment.id).join(',')??'';
 const completed=state?.learning.completed.join(',')??'';
 useEffect(()=>{if(!userId)return;setSnapshot({userId,data:null,loading:true,error:''});void refresh();},[userId,refresh]);
 useEffect(()=>{if(!userId||pending||!state)return;let cancelled=false;const timer=setTimeout(async()=>{try{await classroomRequest({action:'sync'});if(!cancelled)await refresh();}catch{/* The classroom screen exposes connection errors without blocking personal learning. */}},600);return()=>{cancelled=true;clearTimeout(timer);};},[userId,pending,completed,assignmentIds,refresh,!!state]);
 useEffect(()=>{if(!userId||!overview||!(overview.ownedClasses.length+overview.joinedClasses.length))return;const timer=setInterval(()=>void refresh(),30000);const focus=()=>void refresh();window.addEventListener('focus',focus);return()=>{clearInterval(timer);window.removeEventListener('focus',focus);};},[userId,overview?.ownedClasses.length,overview?.joinedClasses.length,refresh]);
 return <Context.Provider value={{userId,overview,loading:!!userId&&(snapshot.userId!==userId||snapshot.loading),error:snapshot.userId===userId?snapshot.error:'',refresh,act}}>{children}</Context.Provider>;
}
