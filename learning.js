// Learning progress uses guest browser storage or a separate authenticated Supabase table.
import {loadLearningProgress,saveLearningProgress} from "./supabase.js";
const modules = [
 {title:"Investing Basics",lessons:[
  {title:"What is a stock?",body:"A stock represents a small ownership stake in a company. Its price can rise or fall, and returns are never guaranteed."},
  {title:"Risk and diversification",body:"Diversification means spreading investments across different assets to reduce dependence on any single holding."},
  {title:"Long-term investing",body:"Compounding can grow returns over time, but investments can lose value. Time horizon and risk tolerance matter."}],
  questions:[
   ["A stock represents…",["Company ownership","A guaranteed loan","A savings account"],0],
   ["Diversification means…",["Buying one stock","Spreading investments","Avoiding all risk"],1],
   ["Stock prices can…",["Only increase","Never change","Rise or fall"],2],
   ["Compounding is…",["Returns earning returns","A fixed promise","A trading fee"],0],
   ["Before investing consider…",["Only trends","Risk and time horizon","Social media hype"],1]]},
 {title:"Money Management",lessons:[
  {title:"Build a budget",body:"A budget compares income with spending and saving. Start by identifying essentials and flexible expenses."},
  {title:"Emergency savings",body:"An emergency fund is money set aside for unexpected expenses, ideally kept accessible rather than exposed to market swings."},
  {title:"Credit fundamentals",body:"Payment history and utilization influence credit health. Paying on time and avoiding unnecessary debt can help."}],
  questions:[
   ["A budget helps you…",["Track income and expenses","Predict stock prices","Avoid all taxes"],0],
   ["Emergency savings should be…",["Hard to access","Accessible when needed","Invested only in risky stocks"],1],
   ["Paying bills on time can help…",["Credit history","Stock volatility","Exchange hours"],0],
   ["Credit utilization refers to…",["Available credit used","Annual salary","Your savings rate"],0],
   ["An essential expense is often…",["Housing","Impulse shopping","A collectible"],0]]}
];

// Additional practical learning tracks. Earlier module IDs remain stable for saved progress.
modules.push(
 {title:"ETFs & Index Funds",lessons:[
  {title:"What is an ETF?",body:"An exchange-traded fund holds a basket of assets and trades on an exchange. ETFs can diversify holdings, but prices can fall."},
  {title:"Index investing",body:"An index fund aims to track a market index rather than select individual winners. Tracking error and fees still matter."},
  {title:"Expense ratios",body:"An expense ratio is an annual fund operating cost expressed as a percentage. Higher fees reduce returns, all else equal."}],
  questions:[
   ["An ETF typically holds…",["A basket of assets","Guaranteed profits","Only cash"],0],
   ["Index funds aim to…",["Predict tomorrow's winner","Track an index","Eliminate losses"],1],
   ["Expense ratios represent…",["Fund costs","Dividend guarantees","Stock splits"],0],
   ["ETFs can…",["Never lose money","Always outperform","Fall in value"],2],
   ["Diversification helps reduce…",["All risk","Single-holding concentration","Taxes to zero"],1]]},
 {title:"Trading & Risk",lessons:[
  {title:"Market vs. limit orders",body:"A market order prioritizes execution, not a specific price. A limit order sets a price boundary but might not fill."},
  {title:"Position sizing",body:"Position sizing determines how much of a portfolio is exposed to one idea. Large concentrated bets increase risk."},
  {title:"Volatility and discipline",body:"Volatility describes price movement. A written plan and realistic loss limits can reduce emotional decisions."}],
  questions:[
   ["A market order prioritizes…",["A guaranteed price","Execution","No fees"],1],
   ["A limit order…",["Must always fill","Guarantees profit","Sets a price boundary"],2],
   ["Position sizing controls…",["Exposure to one trade","Exchange opening hours","Company earnings"],0],
   ["Volatility describes…",["Price movement","Bank interest only","Tax rates"],0],
   ["A trading plan can help…",["Eliminate risk","Manage decisions","Guarantee returns"],1]]}
);

const storageKey="sprout-learning-preview-v1";
let state={completed:{},passed:{},xp:0,activityDays:[]};
let signedIn=false, cloudEnabled=false, renderLearning=null, saving=Promise.resolve();
const clean=v=>({completed:v?.completed&&typeof v.completed==="object"?v.completed:{},passed:v?.passed&&typeof v.passed==="object"?v.passed:{},xp:Number.isFinite(v?.xp)&&v.xp>=0?v.xp:0,activityDays:Array.isArray(v?.activityDays)?v.activityDays.filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-365):[]});
function status(message){const el=document.getElementById("learn-sync-status");if(el)el.textContent=message;}
export async function setLearningUser(isSignedIn){
 signedIn=!!isSignedIn;cloudEnabled=false;
 if(!signedIn){try{state=clean(JSON.parse(localStorage.getItem(storageKey)));}catch{state=clean(null);}status("Guest progress saved on this device");renderLearning?.();updateDashboard();return;}
 status("Loading your learning progress…");
 try{const cloud=await loadLearningProgress();if(!signedIn)return;state=clean(cloud);cloudEnabled=true;status("Learning progress synced to your account");}
 catch(error){if(!signedIn)return;state=clean(null);status("Learning sync unavailable: "+error.message+". Progress changes are disabled until sync works.");}
 renderLearning?.();updateDashboard();
}
try {const saved=JSON.parse(localStorage.getItem(storageKey));if(saved&&typeof saved==="object")state={completed:saved.completed||{},passed:saved.passed||{},xp:Number(saved.xp)||0,activityDays:Array.isArray(saved.activityDays)?saved.activityDays:[]};}catch{}
const recordActivity=()=>{const day=new Date().toLocaleDateString("en-CA");state.activityDays=Array.isArray(state.activityDays)?state.activityDays:[];if(!state.activityDays.includes(day))state.activityDays.push(day);state.activityDays=state.activityDays.slice(-365);};
const streak=()=>{const days=new Set(state.activityDays||[]);let d=new Date();if(!days.has(d.toLocaleDateString("en-CA")))d.setDate(d.getDate()-1);let count=0;while(days.has(d.toLocaleDateString("en-CA"))){count++;d.setDate(d.getDate()-1);}return count;};
const save=()=>{if(signedIn){if(!cloudEnabled)return;const snapshot=structuredClone(state);saving=saving.catch(()=>{}).then(()=>saveLearningProgress(snapshot)).then(()=>status("Learning progress synced to your account")).catch(error=>{cloudEnabled=false;status("Learning save failed: "+error.message+". Sign in again to retry.");});}else{try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{status("Browser storage is unavailable.");}}updateDashboard();};
function updateDashboard(){const total=modules.reduce((n,m)=>n+m.lessons.length,0);const done=Object.keys(state.completed).filter(k=>state.completed[k]).length;const stats={"dashboard-streak":streak()+" days","dashboard-achievements":(Number(Object.keys(state.completed).filter(k=>state.completed[k]).length>=1)+Number(state.xp>=100)+Number(Object.values(state.passed).filter(Boolean).length>=2)+Number(streak()>=3))+" / 4","dashboard-xp":state.xp,"dashboard-lessons":done+" / "+total,"dashboard-modules":Object.values(state.passed).filter(Boolean).length+" / "+modules.length,"dashboard-progress":Math.round(done/total*100)+"%"};for(const [id,value] of Object.entries(stats)){const el=document.getElementById(id);if(el)el.textContent=value;}}
export function mountLearning(root){
 root.innerHTML='<div class="learn-head"><div><p class="eyebrow">SPROUT ACADEMY</p><h2>Learn money. Build confidence.</h2><p>Short lessons, knowledge checks, and progress you can track.</p></div><strong id="learn-xp"></strong></div><p id="learn-sync-status" role="status">Guest progress saved on this device</p><div id="learn-modules"></div><div id="learn-detail" aria-live="polite"></div>';
 const modulesEl=root.querySelector("#learn-modules"),detail=root.querySelector("#learn-detail"),xpEl=root.querySelector("#learn-xp");
 function render(){xpEl.textContent=state.xp+" XP";modulesEl.innerHTML="";modules.forEach((m,i)=>{const unlocked=i===0||state.passed[i-1];const done=m.lessons.filter((_,j)=>state.completed[i+":"+j]).length;const b=document.createElement("button");b.className="learn-module";b.disabled=!unlocked;b.textContent=(unlocked?"":"🔒 ")+m.title+" · "+done+"/"+m.lessons.length+" lessons"+(state.passed[i]?" · Quiz passed ✓":"");b.onclick=()=>showModule(i);modulesEl.append(b);});}
 renderLearning=render;
 function showModule(i){const m=modules[i];detail.replaceChildren();const h=document.createElement("h3");h.textContent=m.title;detail.append(h);m.lessons.forEach((lesson,j)=>{const wrap=document.createElement("article");wrap.className="learn-lesson";const title=document.createElement("h4");title.textContent=(state.completed[i+":"+j]?"✓ ":"")+lesson.title;const p=document.createElement("p");p.textContent=lesson.body;const b=document.createElement("button");b.className="secondary";b.textContent=state.completed[i+":"+j]?"Completed":"Mark lesson complete";b.disabled=!!state.completed[i+":"+j]||(signedIn&&!cloudEnabled);b.onclick=()=>{if(state.completed[i+":"+j])return;state.completed[i+":"+j]=true;state.xp+=10;recordActivity();save();render();showModule(i);};wrap.append(title,p,b);detail.append(wrap);});if(m.lessons.every((_,j)=>state.completed[i+":"+j])){const b=document.createElement("button");b.className="primary learn-quiz-btn";b.textContent=state.passed[i]?"Retake quiz":"Take 5-question quiz";b.disabled=signedIn&&!cloudEnabled;b.onclick=()=>showQuiz(i);detail.append(b);}else{const p=document.createElement("p");p.textContent="Complete every lesson to unlock the quiz.";detail.append(p);}}
 function showQuiz(i){const m=modules[i];detail.replaceChildren();const h=document.createElement("h3");h.textContent=m.title+" · Knowledge check";detail.append(h);const form=document.createElement("form");m.questions.forEach(([question,answers],j)=>{const field=document.createElement("fieldset");const legend=document.createElement("legend");legend.textContent=(j+1)+". "+question;field.append(legend);answers.forEach((answer,k)=>{const label=document.createElement("label");const input=document.createElement("input");input.type="radio";input.name="q"+j;input.value=String(k);input.required=true;label.append(input,document.createTextNode(" "+answer));field.append(label);});form.append(field);});const submit=document.createElement("button");submit.type="submit";submit.disabled=signedIn&&!cloudEnabled;submit.className="primary learn-quiz-btn";submit.textContent="Submit quiz";const result=document.createElement("p");result.setAttribute("role","status");form.append(submit,result);form.onsubmit=e=>{e.preventDefault();const values=new FormData(form);const score=m.questions.reduce((n,q,j)=>n+(Number(values.get("q"+j))===q[2]?1:0),0);if(score>=4){if(!state.passed[i]){state.passed[i]=true;state.xp+=50;recordActivity();save();}render();result.textContent="Passed! "+score+"/5 correct. "+(state.passed[i]?"Next module unlocked.":"")+" First-time passes earn 50 XP.";submit.disabled=true;}else result.textContent=score+"/5 correct. You need 4/5 to pass. Review the lessons and try again.";};detail.append(form);}
 render();updateDashboard();
}
