"use client";
export interface Mark {x1:number;y1:number;x2:number;y2:number;}
export const isMark=(v:unknown):v is Mark=>{
 if(!v||typeof v!=="object")return false;
 return ["x1","y1","x2","y2"].every(k=>{const n=(v as Record<string,unknown>)[k];return typeof n==="number"&&Number.isFinite(n)&&n>=0&&n<=1;});
};
export default function ChartMarkup({marks,onChange}: {marks:Mark[];onChange?:(m:Mark[])=>void}){
 return <div><svg className="markup-chart" viewBox="0 0 600 240" role="img" aria-label="Example chart with your support and risk annotations" onPointerDown={e=>{
 if(!onChange||marks.length>=20)return;
 const svg=e.currentTarget,rect=svg.getBoundingClientRect();
 const point=(clientX:number,clientY:number)=>({x:Math.max(0,Math.min(1,(clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(clientY-rect.top)/rect.height))});
 const start=point(e.clientX,e.clientY);
 svg.setPointerCapture(e.pointerId);
 const finish=(event:PointerEvent)=>{const end=point(event.clientX,event.clientY);onChange([...marks,{x1:start.x,y1:start.y,x2:end.x,y2:end.y}]);svg.removeEventListener("pointerup",finish);};
 svg.addEventListener("pointerup",finish,{once:true});
 }}>
 {[50,100,150,200].map(y=><line key={y} x1="10" x2="590" y1={y} y2={y} stroke="var(--line)"/>)}
 <polyline points="20,190 60,150 100,170 140,120 180,140 220,85 260,115 300,95 340,140 380,120 420,155 460,110 500,80 540,105 580,60" fill="none" stroke="var(--green)" strokeWidth="3"/>
 {marks.filter(isMark).map((m,i)=><line key={i} x1={m.x1*600} y1={m.y1*240} x2={m.x2*600} y2={m.y2*240} stroke="#b08cf0" strokeWidth="3"/>)}
 </svg>{onChange&&<div className="hero-buttons"><button className="secondary" type="button" disabled={marks.length>=20} onClick={()=>onChange([...marks,{x1:.05,y1:.63,x2:.95,y2:.63}])}>Add support line</button><button className="secondary" type="button" disabled={marks.length>=20} onClick={()=>onChange([...marks,{x1:.05,y1:.83,x2:.95,y2:.83}])}>Add risk line</button><button className="secondary" type="button" disabled={!marks.length} onClick={()=>onChange(marks.slice(0,-1))}>Undo annotation</button></div>}</div>;
}
