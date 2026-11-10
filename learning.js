// Learning preview: browser-local progress, isolated from trading and Supabase accounts.
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
const storageKey="sprout-learning-preview-v1";
let state={completed:{},passed:{},xp:0};
try {const saved=JSON.parse(localStorage.getItem(storageKey));if(saved&&typeof saved==="object")state={completed:saved.completed||{},passed:saved.passed||{},xp:Number(saved.xp)||0};}catch{}
const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{}};
export function mountLearning(root){
 root.innerHTML='<div class="learn-head"><div><p class="eyebrow">SPROUT ACADEMY</p><h2>Learn money. Build confidence.</h2><p>Short lessons, knowledge checks, and progress you can track.</p></div><strong id="learn-xp"></strong></div><div id="learn-modules"></div><div id="learn-detail" aria-live="polite"></div>';
 const modulesEl=root.querySelector("#learn-modules"),detail=root.querySelector("#learn-detail"),xpEl=root.querySelector("#learn-xp");
 function render(){xpEl.textContent=state.xp+" XP";modulesEl.innerHTML="";modules.forEach((m,i)=>{const unlocked=i===0||state.passed[i-1];const done=m.lessons.filter((_,j)=>state.completed[i+":"+j]).length;const b=document.createElement("button");b.className="learn-module";b.disabled=!unlocked;b.textContent=(unlocked?"":"🔒 ")+m.title+" · "+done+"/"+m.lessons.length+" lessons"+(state.passed[i]?" · Quiz passed ✓":"");b.onclick=()=>showModule(i);modulesEl.append(b);});}
 function showModule(i){const m=modules[i];detail.replaceChildren();const h=document.createElement("h3");h.textContent=m.title;detail.append(h);m.lessons.forEach((lesson,j)=>{const wrap=document.createElement("article");wrap.className="learn-lesson";const title=document.createElement("h4");title.textContent=(state.completed[i+":"+j]?"✓ ":"")+lesson.title;const p=document.createElement("p");p.textContent=lesson.body;const b=document.createElement("button");b.className="secondary";b.textContent=state.completed[i+":"+j]?"Completed":"Mark lesson complete";b.disabled=!!state.completed[i+":"+j];b.onclick=()=>{if(state.completed[i+":"+j])return;state.completed[i+":"+j]=true;state.xp+=10;save();render();showModule(i);};wrap.append(title,p,b);detail.append(wrap);});if(m.lessons.every((_,j)=>state.completed[i+":"+j])){const b=document.createElement("button");b.className="primary learn-quiz-btn";b.textContent=state.passed[i]?"Retake quiz":"Take 5-question quiz";b.onclick=()=>showQuiz(i);detail.append(b);}else{const p=document.createElement("p");p.textContent="Complete every lesson to unlock the quiz.";detail.append(p);}}
 function showQuiz(i){const m=modules[i];detail.replaceChildren();const h=document.createElement("h3");h.textContent=m.title+" · Knowledge check";detail.append(h);const form=document.createElement("form");m.questions.forEach(([question,answers],j)=>{const field=document.createElement("fieldset");const legend=document.createElement("legend");legend.textContent=(j+1)+". "+question;field.append(legend);answers.forEach((answer,k)=>{const label=document.createElement("label");const input=document.createElement("input");input.type="radio";input.name="q"+j;input.value=String(k);input.required=true;label.append(input,document.createTextNode(" "+answer));field.append(label);});form.append(field);});const submit=document.createElement("button");submit.type="submit";submit.className="primary learn-quiz-btn";submit.textContent="Submit quiz";const result=document.createElement("p");result.setAttribute("role","status");form.append(submit,result);form.onsubmit=e=>{e.preventDefault();const values=new FormData(form);const score=m.questions.reduce((n,q,j)=>n+(Number(values.get("q"+j))===q[2]?1:0),0);if(score>=4){if(!state.passed[i]){state.passed[i]=true;state.xp+=50;save();}render();result.textContent="Passed! "+score+"/5 correct. +50 XP on first pass. Next module unlocked.";submit.disabled=true;}else result.textContent=score+"/5 correct. You need 4/5 to pass. Review the lessons and try again.";};detail.append(form);}
 render();
}
