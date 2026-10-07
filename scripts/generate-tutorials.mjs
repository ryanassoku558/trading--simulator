// Rebuild original caption-led tutorials: node scripts/generate-tutorials.mjs
// Requires ffmpeg and generated narration (scripts/narrate-tutorials.py).
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import chromium from '@sparticuz/chromium';
import {chromium as playwright} from '@playwright/test';
const requested=process.argv.slice(2);
const tutorials=JSON.parse(readFileSync('lib/education/tutorials.json','utf8')).filter(t=>!requested.length||requested.includes(t.slug));
const narrationDir=process.env.TUTORIAL_NARRATION_DIR||'/tmp/sprout-narration';
const catalogue=JSON.parse(readFileSync('lib/education/tutorials.json','utf8'));
const temp=mkdtempSync(join(tmpdir(),'sprout-tutorials-'));
mkdirSync('public/tutorials',{recursive:true});
const browser=await playwright.launch({executablePath:await chromium.executablePath(),args:chromium.args.filter(a=>a!=='--single-process'),headless:true});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
const escape=t=>t.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function diagram(kind){
 const candle=(x,color,open,close)=>`<line x1="${x}" y1="95" x2="${x}" y2="310" stroke="${color}" stroke-width="7"/><rect x="${x-26}" y="${Math.min(open,close)}" width="52" height="${Math.abs(close-open)}" fill="${color}" rx="4"/>`;
 let art='';
 if(kind==='risk-budget')art=`<rect x="35" y="80" width="330" height="225" rx="24" fill="#19483e"/><text x="65" y="130">ACCOUNT: $1,000</text><text x="65" y="185">1% RISK = $10</text><text x="65" y="240">$10 ÷ $2 = 5 SHARES</text><text x="65" y="350">PLAN LOSS BEFORE ENTRY</text>`;
 else if(kind==='levels')art=`<path d="M25 280L80 150L140 260L200 140L255 255L320 130L370 220" stroke="#64efbe" stroke-width="7" fill="none"/><path d="M20 140H380M20 280H380" stroke="#c1adff" stroke-width="3" stroke-dasharray="8 8"/><text x="30" y="110">RESISTANCE AREA</text><text x="30" y="335">SUPPORT AREA</text>`;
 else if(kind==='basket')art=`<rect x="25" y="70" width="350" height="250" rx="24" fill="#19483e" stroke="#64efbe" stroke-width="2"/>${['A','B','C','D'].map((t,i)=>`<circle cx="${100+i%2*180}" cy="${140+Math.floor(i/2)*110}" r="32" fill="#335b58"/><text x="${92+i%2*180}" y="${147+Math.floor(i/2)*110}">${t}</text>`).join('')}<text x="70" y="370">CHECK FUND HOLDINGS</text>`;
 else if(kind==='research')art=`<rect x="40" y="50" width="320" height="320" rx="18" fill="#19483e"/>${['BUSINESS','CASH FLOW','DEBT & RISKS','PUBLIC SOURCES'].map((t,i)=>`<path d="M65 ${100+i*70}l10 10 18-22" stroke="#64efbe" stroke-width="5" fill="none"/><text x="112" y="${106+i*70}">${t}</text>`).join('')}`;
 else if(kind==='mindset')art=`<circle cx="200" cy="185" r="100" fill="#19483e" stroke="#64efbe" stroke-width="3"/><path d="M175 140V230M225 140V230" stroke="#64efbe" stroke-width="16"/><text x="82" y="350">PAUSE. REVIEW. PLAN.</text>`;
 else if(kind==='budget')art=`<text x="30" y="70">INCOME $2,000</text><rect x="30" y="100" width="330" height="50" rx="8" fill="#64efbe"/><text x="30" y="205">SPENDING $1,500</text><rect x="30" y="230" width="247" height="50" rx="8" fill="#c1adff"/><text x="30" y="355">REMAINING $500</text>`;
 else if(kind==='compound')art=`<rect x="35" y="190" width="80" height="120" rx="8" fill="#335b58"/><rect x="155" y="175" width="80" height="135" rx="8" fill="#4c937b"/><rect x="275" y="155" width="80" height="155" rx="8" fill="#64efbe"/><text x="38" y="165">$1,000</text><text x="157" y="150">$1,050</text><text x="274" y="130">$1,102.50</text><text x="50" y="355">HYPOTHETICAL 5% / YEAR</text>`;
 else if(kind==='returns')art=`<path d="M40 260L130 220L210 240L300 140L360 100" stroke="#64efbe" stroke-width="8" fill="none"/><text x="40" y="80">2 SHARES: $100 → $110</text><text x="70" y="345">+$20 BEFORE COSTS</text>`;
 else if(['candle','body','wicks','colors'].includes(kind))art=candle(120,'#64efbe',250,155)+candle(245,'#ff889a',155,245)+`<text x="22" y="60">HIGH $110</text><text x="20" y="365">LOW $95</text><text x="180" y="145">CLOSE $105</text><text x="178" y="282">OPEN $100</text>`;
 else if(['day','timeline','week'].includes(kind))art=`<path d="M30 190H350" stroke="#4b7280" stroke-width="8"/><circle cx="70" cy="190" r="22" fill="#64efbe"/><circle cx="305" cy="190" r="22" fill="#c1adff"/><text x="35" y="145">BUY</text><text x="260" y="145">SELL</text><text x="20" y="265">${kind==='week'?'MONDAY':'10 A.M.'}</text><text x="255" y="265">${kind==='week'?'FRIDAY':'2 P.M.'}</text><text x="70" y="345">${kind==='week'?'DIFFERENT DAYS':'SAME TRADING DAY'}</text>`;
 else if(['orders','market','limit','wait'].includes(kind))art=`<path d="M20 260L70 210L120 250L180 140L230 170L285 110L350 130" stroke="#64efbe" stroke-width="8" fill="none"/><path d="M20 225H350" stroke="#c1adff" stroke-width="3" stroke-dasharray="10 9"/><text x="30" y="320">${kind==='market'?'MARKET: AVAILABLE PRICE':'BUY LIMIT: $100 OR LESS'}</text>`;
 else if(['gain','loss','risk'].includes(kind))art=`<path d="M30 ${kind==='gain'?280:120}L105 210L175 230L245 160L350 ${kind==='gain'?80:300}" stroke="${kind==='gain'?'#64efbe':'#ff889a'}" stroke-width="9" fill="none"/><text x="75" y="370">${kind==='gain'?'2 × $110 = $220':kind==='loss'?'2 × $90 = $180':'LOSSES ARE POSSIBLE'}</text>`;
 else art=`<rect x="45" y="100" width="270" height="210" rx="24" fill="#19483e" stroke="#64efbe" stroke-width="2"/><circle cx="180" cy="172" r="37" fill="#64efbe"/><path d="M162 172L175 185L201 157" stroke="#13302c" stroke-width="8" fill="none"/><text x="105" y="267">${kind==='buy'?'2 SHARES':kind==='ownership'?'OWNERSHIP':'PRACTICE'}</text>`;
 return `<svg viewBox="0 0 400 420"><g fill="#dbece9" font-family="Arial" font-size="19" font-weight="700">${art}</g></svg>`;
}
function ffmpeg(args){const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit'});if(r.status!==0)throw Error('ffmpeg failed');}
for(const video of tutorials){
 let vtt='WEBVTT\n\n';const clips=[];let offset=0,cueIndex=1;
 for(let i=0;i<video.scenes.length;i++){
 const scene=video.scenes[i];
 const narration=JSON.parse(readFileSync(join(narrationDir,`${video.slug}-${i}.json`),'utf8'));
 const duration=narration.duration,wav=join(narrationDir,`${video.slug}-${i}.wav`);
 await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 85% 30%,#25544d 0%,#0b1926 58%);font-family:Arial;color:white}.frame{padding:48px 66px;height:720px;display:flex;flex-direction:column}.brand{color:#64efbe;font-weight:700;font-size:27px;letter-spacing:1px}.topic{color:#b7c8d7;font-size:20px;margin-top:14px}.body{display:grid;grid-template-columns:1.5fr 1fr;align-items:center;gap:55px;flex:1}h1{font-size:49px;line-height:1.12;letter-spacing:-1.4px;margin:0 0 27px}p{font-size:29px;line-height:1.45;color:#d4e3e7;margin:0}svg{width:100%}.footer{display:flex;justify-content:space-between;font-size:18px;color:#b9cad6}.progress{display:flex;gap:8px;margin-bottom:22px}.progress b{height:5px;flex:1;border-radius:5px;background:#294452}.progress b.done{background:#64efbe}</style><div class="frame"><div class="brand">sprout. <span style="color:white;font-size:16px">TRADING</span></div><div class="topic">NARRATED STARTER · ${escape(video.title)}</div><div class="body"><div><h1>${escape(scene.title)}</h1><p>${escape(scene.caption)}</p></div>${diagram(scene.visual)}</div><div class="progress">${video.scenes.map((_,j)=>`<b class="${j<=i?'done':''}"></b>`).join('')}</div><div class="footer"><span>Learn. Practice. Grow.</span><span>${i+1} / 5 · EDUCATIONAL EXAMPLES</span></div></div>`);
 const png=join(temp,`${video.slug}-${i}.png`),clip=join(temp,`${video.slug}-${i}.mp4`);
 await page.screenshot({path:png});
 if(i===0)ffmpeg(["-i",png,"-frames:v","1","-c:v","libwebp",`public/tutorials/${video.slug}.webp`]);
 ffmpeg(['-loop','1','-i',png,'-i',wav,'-vf',`zoompan=z='min(zoom+0.00015,1.025)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=${Math.ceil(duration*24)}:s=1280x720:fps=24,fade=t=in:st=0:d=0.25,fade=t=out:st=${duration-0.25}:d=0.25`,'-t',String(duration),'-c:v','libx264','-preset','veryfast','-crf','24','-pix_fmt','yuv420p','-threads','2','-c:a','aac','-b:a','96k','-af','apad',clip]);clips.push(clip);
 const stamp=n=>{const ms=Math.round(n*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;};
 for(const cue of narration.cues)vtt+=`${cueIndex++}\n${stamp(offset+cue.start)} --> ${stamp(offset+cue.end)}\n${cue.text}\n\n`;
 const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',clip],{encoding:'utf8'});if(probe.status!==0)throw Error('Could not measure narration clip');offset+=Number(probe.stdout);

 }
 const list=join(temp,`${video.slug}.txt`);writeFileSync(list,clips.map(c=>`file '${c}'`).join('\n'));
 ffmpeg(['-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart',`public/tutorials/${video.slug}.mp4`]);
 writeFileSync(`public/tutorials/${video.slug}.vtt`,vtt);
 catalogue.find(t=>t.slug===video.slug).duration=Math.round(offset);
 console.log(`Created ${video.slug}: ${Math.round(offset)} seconds with narration`);
}
writeFileSync('lib/education/tutorials.json',JSON.stringify(catalogue,null,2)+'\n');
await browser.close();
