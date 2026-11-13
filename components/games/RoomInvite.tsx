"use client";
import {QRCodeSVG} from 'qrcode.react';
import {Download,ScanLine} from 'lucide-react';
import {useRef} from 'react';

export default function RoomInvite({code,url}:{code:string;url:string}){
 const image=useRef<HTMLDivElement>(null);
 function download(){
  const svg=image.current?.querySelector('svg');if(!svg)return;
  const file=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
  const link=document.createElement('a');link.href=file;link.download=`Sprout-room-${code}.svg`;link.click();setTimeout(()=>URL.revokeObjectURL(file),1000);
 }
 return <aside className="live-room-invite" aria-label="Invite players with a QR code">
  <div className="live-room-qr" ref={image}><QRCodeSVG value={url} size={224} level="M" marginSize={4} bgColor="#ffffff" fgColor="#09271c" role="img" aria-label={`Scan to join Sprout room ${code}`}/></div>
  <div><span className="eyebrow"><ScanLine size={17}/> SCAN. JOIN. GROW.</span><h3>Join from your phone</h3><p>Scan with your camera, choose a nickname, and you’re in. No account needed.</p><a className="text-link" href={url} target="_blank" rel="noopener noreferrer">Open join page ↗</a><button type="button" className="secondary" onClick={download}><Download size={16}/> Download QR code</button><small>Keep this QR code in your slides. Your saved quiz and room link do not expire; activate the game before inviting players to join.</small></div>
 </aside>;
}
