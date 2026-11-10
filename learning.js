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
let state={completed:{},passed:{},xp:0,activityDays:[],dailyXP:{}};
let signedIn=false, cloudEnabled=false, renderLearning=null, saving=Promise.resolve(),celebrationTimer,userGeneration=0;
const clean=v=>({completed:v?.completed&&typeof v.completed==="object"?v.completed:{},passed:v?.passed&&typeof v.passed==="object"?v.passed:{},xp:Number.isFinite(v?.xp)&&v.xp>=0?v.xp:0,activityDays:Array.isArray(v?.activityDays)?v.activityDays.filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-365):[],dailyXP:v?.dailyXP&&typeof v.dailyXP==="object"?Object.fromEntries(Object.entries(v.dailyXP).filter(([day,xp])=>/^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(xp)&&xp>=0).slice(-365)):{}});
function status(message){const el=document.getElementById("learn-sync-status");if(el)el.textContent=message;}
export async function setLearningUser(isSignedIn){
 const generation=++userGeneration;signedIn=!!isSignedIn;cloudEnabled=false;
 if(!signedIn){try{state=clean(JSON.parse(localStorage.getItem(storageKey)));}catch{state=clean(null);}status("Guest progress saved on this device");renderLearning?.();updateDashboard();return;}
 state=clean(null);renderLearning?.();updateDashboard();status("Loading your learning progress…");
 try{const cloud=await loadLearningProgress();if(generation!==userGeneration)return;state=clean(cloud);cloudEnabled=true;status("Learning progress synced to your account");}
 catch(error){if(generation!==userGeneration)return;state=clean(null);status("Learning sync unavailable: "+error.message+". Progress changes are disabled until sync works.");}
 renderLearning?.();updateDashboard();
}
try {state=clean(JSON.parse(localStorage.getItem(storageKey)));}catch{}
const recordActivity=(xp)=>{const day=new Date().toLocaleDateString("en-CA");state.activityDays=Array.isArray(state.activityDays)?state.activityDays:[];if(!state.activityDays.includes(day))state.activityDays.push(day);state.activityDays=state.activityDays.slice(-365);state.dailyXP=state.dailyXP||{};state.dailyXP[day]=(state.dailyXP[day]||0)+xp;state.dailyXP=Object.fromEntries(Object.entries(state.dailyXP).slice(-365));};
const streak=()=>{const days=new Set(state.activityDays||[]);let d=new Date();if(!days.has(d.toLocaleDateString("en-CA")))d.setDate(d.getDate()-1);let count=0;while(days.has(d.toLocaleDateString("en-CA"))){count++;d.setDate(d.getDate()-1);}return count;};
const save=()=>{
 if(signedIn){
  if(!cloudEnabled)return;const snapshot=structuredClone(state),generation=userGeneration;
  status("Saving learning progress…");
  saving=saving.catch(()=>{}).then(()=>{if(generation!==userGeneration||!cloudEnabled)return;return saveLearningProgress(snapshot);}).then(()=>{if(generation===userGeneration&&cloudEnabled)status("Learning progress synced to your account");}).catch(error=>{if(generation!==userGeneration)return;cloudEnabled=false;renderLearning?.();status("Learning save failed: "+error.message+". Sign out and sign in to reload saved progress.");});
 }else{try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{status("Browser storage is unavailable.");}}
 updateDashboard();
};
function celebrate(message){const target=document.getElementById("learning-celebration");if(!target)return;clearTimeout(celebrationTimer);target.textContent=message;target.hidden=false;celebrationTimer=setTimeout(()=>{target.hidden=true;},4500);}
function longestStreak(){const days=[...new Set(state.activityDays)].sort();let longest=0,current=0,previous;for(const day of days){const date=new Date(day+"T12:00:00");if(previous){previous.setDate(previous.getDate()+1);current=previous.toLocaleDateString("en-CA")===day?current+1:1;}else current=1;longest=Math.max(longest,current);previous=date;}return longest;}
function updateDashboard(){
 const total=modules.reduce((n,m)=>n+m.lessons.length+1,0);
 const lessons=modules.reduce((n,m,i)=>n+m.lessons.filter((_,j)=>state.completed[i+":"+j]).length,0);
 const passed=modules.filter((_,i)=>state.passed[i]).length;
 const percent=Math.round((lessons+passed)/total*100);
 const stats={"dashboard-streak":streak()+" "+(streak()===1?"day":"days"),"dashboard-achievements":(Number(lessons>=1)+Number(state.xp>=100)+Number(passed>=2)+Number(longestStreak()>=3))+" / 4","dashboard-xp":state.xp,"dashboard-lessons":lessons+" / "+(total-modules.length),"dashboard-modules":passed+" / "+modules.length,"dashboard-progress":percent+"%","journey-percent":percent+"%","journey-level":"Level "+(Math.floor(state.xp/100)+1),"journey-xp":(state.xp%100)+" / 100 XP to next level"};
 for(const [id,value] of Object.entries(stats)){const el=document.getElementById(id);if(el)el.textContent=value;}
 const badges=[["🌱","First sprout","Complete your first lesson",lessons>=1],["✦","On a roll","Earn 100 learning XP",state.xp>=100],["📚","Knowledge builder","Pass two modules",passed>=2],["🔥","Steady grower","Learn three days in a row",longestStreak()>=3]];
 const grid=document.getElementById("achievement-grid");if(grid){grid.replaceChildren();for(const [icon,title,description,earned] of badges){const card=document.createElement("article");card.className="achievement-card"+(earned?" earned":"");const mark=document.createElement("span");mark.className="achievement-icon";mark.textContent=icon;const heading=document.createElement("h3");heading.textContent=title;const copy=document.createElement("p");copy.textContent=description;const tag=document.createElement("small");tag.textContent=earned?"✓ Earned":"In progress";card.append(mark,heading,copy,tag);grid.append(card);}}
 const today=new Date().toLocaleDateString("en-CA"),daily=state.dailyXP?.[today]||0;
 const dailyBar=document.getElementById("daily-goal-bar");if(dailyBar)dailyBar.value=Math.min(daily,20);
 const dailyLabel=document.getElementById("daily-goal-label");if(dailyLabel)dailyLabel.textContent=daily+" / 20 XP";
 const dailyCopy=document.getElementById("daily-goal-copy");if(dailyCopy)dailyCopy.textContent=daily>=20?"Daily goal complete! Come back tomorrow for your next step.":"Earn "+(20-daily)+" more XP today. Every short lesson counts.";
 const bar=document.getElementById("journey-bar");if(bar)bar.value=percent;
 const next=modules.findIndex((_,i)=>!state.passed[i]);
 if(next<0){const xp=document.getElementById("journey-xp");if(xp)xp.textContent=state.xp+" XP earned · Course complete";const level=document.getElementById("journey-level");if(level)level.textContent="Academy graduate";}
 const dailyTitle=document.getElementById("daily-goal-title");if(dailyTitle)dailyTitle.textContent=next<0?"Your next chapter":"Your daily learning goal";
 if(dailyBar)dailyBar.hidden=next<0;
 if(next<0){if(dailyCopy)dailyCopy.textContent="You’ve completed the course. Keep applying your skills in the practice simulator.";if(dailyLabel)dailyLabel.textContent="Learning path complete ✓";}

 const prompt=document.getElementById("journey-next");
 if(prompt)prompt.textContent=next<0?"All modules complete! Keep your skills growing in the simulator.":"Up next: "+modules[next].title+" · "+(modules[next].lessons.every((_,j)=>state.completed[next+":"+j])?"5-question knowledge check":"Your next short lesson");
 const cta=document.getElementById("continue-learning");if(cta)cta.textContent=next<0?"Review your learning path":"Continue learning →";
}
export function mountLearning(root){
 root.innerHTML='<div class="learn-head"><div><p class="eyebrow">SPROUT ACADEMY</p><h2>Small steps. Real growth.</h2><p>Read a lesson, put it to the test, and unlock your next chapter.</p></div><strong id="learn-xp"></strong></div><p id="learn-sync-status" role="status">Guest progress saved on this device</p><div class="learning-workspace"><div id="learn-modules" aria-label="Your learning path"></div><div id="learn-detail" aria-live="polite"></div></div>';
 const modulesEl=root.querySelector("#learn-modules"),detail=root.querySelector("#learn-detail"),xpEl=root.querySelector("#learn-xp");
 let active=0,session=0;
 const locked=i=>i>0&&!state.passed[i-1];
 const writable=()=>!signedIn||cloudEnabled;
 const element=(tag,text,className)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;};
 const button=(text,action,className="secondary")=>{const b=element("button",text,className);b.type="button";b.onclick=action;return b;};
 function render(){
  xpEl.textContent=state.xp+" XP";modulesEl.replaceChildren();
  modules.forEach((m,i)=>{
   const done=m.lessons.filter((_,j)=>state.completed[i+":"+j]).length;
   const b=button("",()=>showModule(i),"learn-module"+(active===i?" current":""));b.disabled=locked(i);b.setAttribute("aria-current",active===i?"step":"false");
   b.append(element("span",state.passed[i]?"✓":locked(i)?"🔒":String(i+1),"module-number"),element("strong",m.title),element("small",state.passed[i]?"Completed · Review anytime":locked(i)?"Pass the previous module to unlock":done+"/"+m.lessons.length+" lessons · +50 XP quiz"));modulesEl.append(b);
  });
 }
 function showModule(i){
  if(locked(i))return;active=i;session++;render();const m=modules[i];detail.replaceChildren();
  detail.append(element("p","CHAPTER "+(i+1)+" / "+modules.length,"eyebrow"),element("h3",m.title));
  m.lessons.forEach((lesson,j)=>{
   const complete=!!state.completed[i+":"+j],wrap=element("article",undefined,"learn-lesson");
   const b=button(complete?"✓ Completed":"Complete lesson · +10 XP",()=>{if(!writable()||state.completed[i+":"+j])return;state.completed[i+":"+j]=true;state.xp+=10;recordActivity(10);save();showModule(i);celebrate("Lesson complete · +10 XP. Keep growing!");});b.disabled=complete||!writable();
   wrap.append(element("h4",lesson.title),element("p",lesson.body),b);detail.append(wrap);
  });
  if(m.lessons.every((_,j)=>state.completed[i+":"+j])){const b=button(state.passed[i]?"Review 5-question quiz":"Start 5-question quiz →",()=>showQuiz(i),"primary learn-quiz-btn");b.disabled=!writable();detail.append(b);}
  else detail.append(element("p","Complete the three lessons to unlock your knowledge check.","lesson-hint"));
 }
 function showQuiz(i){
  if(locked(i)||!writable())return;
  const token=++session,questions=modules[i].questions.slice(0,5);let cursor=0,score=0,answered=false,finished=false;
  function finish(){
   if(finished||token!==session)return;finished=true;
   const passed=score>=4,first=passed&&!state.passed[i];
   if(first){state.passed[i]=true;state.xp+=50;recordActivity(50);save();celebrate("Chapter complete · +50 XP. A new milestone awaits!");}render();detail.replaceChildren();
   detail.append(element("div",passed?"✦":"↻","quiz-medal"),element("p","KNOWLEDGE CHECK COMPLETE","eyebrow"),element("h3",passed?"You’re growing!":"Keep going. You’ve got this."),element("p",score+" / "+questions.length+" correct" ,"quiz-score"),element("p",first?"+50 XP earned · Keep growing your financial skills.":passed?"Great practice! Review quizzes don’t award extra XP.":"Get 4 of 5 correct to pass. Review the lessons and try again."));
   if(passed){if(i+1<modules.length)detail.append(button("Continue to next module →",()=>showModule(i+1),"primary learn-quiz-btn"));else{detail.append(element("p","All four modules complete. Put your knowledge into practice!"));const link=element("a","Practice in the simulator →","sprout-cta");link.href="#simulator";detail.append(link);}}
   else detail.append(button("Try 5 questions again",()=>showQuiz(i),"primary learn-quiz-btn"));
   detail.append(button("Review lessons",()=>showModule(i)));
  }
  function draw(){
   if(token!==session||finished)return;
   detail.replaceChildren();answered=false;const [question,answers,correct]=questions[cursor];
   const top=element("div",undefined,"quiz-top");top.append(element("span","QUESTION "+(cursor+1)+" OF "+questions.length),element("span",score+" correct"));
   const progress=element("progress");progress.max=questions.length;progress.value=cursor;progress.setAttribute("aria-label","Questions answered");
   detail.append(top,progress,element("p",modules[i].title,"eyebrow"));
   const form=element("form"),field=element("fieldset"),legend=element("legend",question);legend.tabIndex=-1;field.append(legend);
   answers.forEach((answer,k)=>{const label=element("label",undefined,"quiz-answer answer-"+k),input=element("input");input.type="radio";input.name="answer";input.value=String(k);input.required=true;label.append(input,element("span",answer));field.append(label);});
   const feedback=element("p",undefined,"quiz-feedback");feedback.setAttribute("role","status");
   const submit=element("button","Check answer","primary learn-quiz-btn");submit.type="submit";
   const next=button(cursor===questions.length-1?"See my results →":"Next question →",()=>{if(!answered||finished||token!==session)return;if(cursor===questions.length-1)finish();else{cursor++;draw();}},"primary learn-quiz-btn");next.hidden=true;
   form.onsubmit=e=>{e.preventDefault();if(answered||finished||token!==session||!writable()||!form.reportValidity())return;answered=true;const choice=Number(new FormData(form).get("answer"));const right=choice===correct;if(right)score++;field.disabled=true;feedback.textContent=right?"✓ Correct! Nice work.":"Keep learning. The correct answer is: "+answers[correct];feedback.classList.toggle("correct",right);submit.hidden=true;next.hidden=false;next.focus();};
   form.append(field,feedback,submit,next);detail.append(form,element("p","5 questions · 4 correct to pass · +50 XP on your first pass","lesson-hint"));legend.focus();
  }
  draw();
 }
 renderLearning=()=>{active=Math.max(0,modules.findIndex((_,i)=>!state.passed[i]));showModule(active);};
 const cta=document.getElementById("continue-learning");if(cta)cta.onclick=()=>renderLearning();
 renderLearning();updateDashboard();
}
