"use client";
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import Logo from '../ui/Logo';
import ThemeToggle from '../ThemeToggle';
import MarketTicker from '../MarketTicker';
import About from './About';
export default function MarketingHome({onAuth,onGuest,pending,tick}:{onAuth:(mode:'signin'|'signup')=>void;onGuest:()=>void;pending:boolean;tick:number}) {
 return <main className="public-home public-about-home academy-shell"><header className="public-nav"><Link href="/" aria-label="Sprout home"><Logo/></Link><nav aria-label="Website navigation"><a href="#how-it-works">How it works</a><Link href="/learn?view=Modules">Explore lessons</Link><Link href="/classrooms">For classrooms</Link><Link href="/pricing">Pricing</Link></nav><div className="public-account-actions"><ThemeToggle/><button className="public-signin" onClick={()=>onAuth('signin')}>Sign in</button><button className="primary" onClick={()=>onAuth('signup')}>Create account <ArrowRight size={15}/></button></div></header><MarketTicker tick={tick}/><div className="public-about-content"><About actions={<><button className="primary" onClick={()=>onAuth('signup')}>Create your free account <ArrowRight size={17}/></button><button className="secondary" onClick={()=>onAuth('signin')}>Sign in</button><button className="public-guest-link" disabled={pending} onClick={onGuest}>Explore without an account <ArrowRight size={15}/></button></>}/></div><footer className="public-footer"><Link href="/" aria-label="Sprout home"><Logo/></Link><p>Financial education. Thoughtful practice.</p><nav aria-label="Footer links"><Link href="/pricing">Pricing</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/support">Contact</Link></nav></footer></main>;
}
