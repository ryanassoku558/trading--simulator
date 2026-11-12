import Link from 'next/link';
import {BookOpen,Layers3,Gamepad2,ChartNoAxesCombined,ArrowUpRight} from 'lucide-react';
export const studyModes=[
 {title:'Learn a concept',tag:'LEARN',copy:'Build understanding with guided lessons, visual examples, and short knowledge checks.',href:'/learn?view=Modules',action:'Explore modules',icon:BookOpen,tone:'mint'},
 {title:'Make it stick',tag:'REVIEW',copy:'Turn new terms into lasting knowledge with flashcards and focused practice.',href:'/play?mode=Flashcards',action:'Study flashcards',icon:Layers3,tone:'violet'},
 {title:'Learn together',tag:'PLAY',copy:'Bring a topic to life. Host a live quiz or join a room with your friends.',href:'/play?mode=Live%20quiz',action:'Choose a game',icon:Gamepad2,tone:'peach'},
 {title:'Put it into practice',tag:'APPLY',copy:'Research an asset, plan a trade, and learn from your virtual portfolio.',href:'/market',action:'Practice trading',icon:ChartNoAxesCombined,tone:'blue'},
];
export default function StudyModes(){return <div className="academy-study-modes">{studyModes.map(m=><Link key={m.tag} href={m.href} className={`academy-mode tone-${m.tone}`}><div className="academy-mode-top"><span className="academy-mode-icon"><m.icon size={24}/></span><span className="academy-mode-tag">{m.tag}</span><ArrowUpRight size={18}/></div><h3>{m.title}</h3><p>{m.copy}</p><span className="academy-mode-action">{m.action} <ArrowUpRight size={15}/></span></Link>)}</div>;}
