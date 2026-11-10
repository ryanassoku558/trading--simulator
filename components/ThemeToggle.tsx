"use client";
import {useSyncExternalStore} from "react";
import {Moon, Sun} from "lucide-react";
function subscribe(update: () => void) {
 window.addEventListener("sprout-theme",update);
 window.addEventListener("storage",update);
 return ()=>{window.removeEventListener("sprout-theme",update);window.removeEventListener("storage",update);};
}
function snapshot(){return document.documentElement.dataset.theme === "dark";}
export default function ThemeToggle(){
 const dark=useSyncExternalStore(subscribe,snapshot,()=>false);
 return <button className="theme-toggle" aria-label={`Switch to ${dark ? "light" : "dark"} mode`} title={`${dark ? "Light" : "Dark"} mode`} onClick={()=>{
 const theme=dark ? "light" : "dark";
 document.documentElement.dataset.theme=theme;
 try{localStorage.setItem("sprout-theme",theme);}catch{}
 window.dispatchEvent(new Event("sprout-theme"));
 }}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>;
}
