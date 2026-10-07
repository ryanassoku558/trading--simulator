import {Sprout} from 'lucide-react';
export default function About({embedded=false}:{embedded?:boolean}){
 const Heading=embedded?'h2':'h1';
 return <section id="about" className={embedded?'card dashboard-mission':'page-heading about-section'}><Sprout size={28}/><div><span className="eyebrow">LEARN. PRACTICE. GROW.</span><Heading>About Sprout Trading</Heading><p>Sprout is a learning platform for people who want to understand trading and personal finance, starting with the basics. Clear lessons, interactive quizzes, helpful planning tools, and a virtual trading simulator let you build skills at your own pace.</p><p>Practice uses simulated prices and virtual money, so you can explore decisions without risking real funds. Sprouty helps explain concepts and guide your next learning step.</p></div></section>;
}
