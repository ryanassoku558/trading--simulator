import {signIn,signUp,signOut,loadAccount,saveAccount} from './supabase.js';
import {initialAccount,trade} from './trading.js';
import {setLearningUser} from './learning.js';
const stocks={AAPL:['Apple Inc.',225],MSFT:['Microsoft Corp.',425],NVDA:['NVIDIA Corp.',135],AMZN:['Amazon.com Inc.',195],GOOGL:['Alphabet Inc.',175],TSLA:['Tesla Inc.',250]};
let user=null,cloudReady=false,busy=false;
const key='paperdesk-account-v1';let account=initialAccount(),storage=true;try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&Number.isFinite(saved.cash)&&saved.cash>=0&&saved.positions&&Array.isArray(saved.trades)&&Object.entries(saved.positions).every(([s,p])=>stocks[s]&&Number.isInteger(p.quantity)&&p.quantity>0&&Number.isFinite(p.average)))account=saved;}catch{storage=false;}
let symbol='AAPL',side='buy',chartWindow=60,priceMode='simulation',quoteAsOf=null,reviewedTrade=false;const prices=Object.fromEntries(Object.entries(stocks).map(([s,v])=>[s,v[1]]));const history=Object.fromEntries(Object.keys(stocks).map(s=>[s,Array.from({length:60},(_,i)=>stocks[s][1]*(1+Math.sin(i/8)*.006+i*.0001))]));const $=id=>document.getElementById(id),money=n=>n.toLocaleString('en-US',{style:'currency',currency:'USD'}),signed=n=>(n>=0?'+':'')+money(n);const save=()=>{if(user)return;try{localStorage.setItem(key,JSON.stringify(account));}catch{storage=false;}};
$('symbol').innerHTML=Object.entries(stocks).map(([s,v])=>`<option value="${s}">${s} — ${v[0]}</option>`).join('');
function render(){const value=Object.entries(account.positions).reduce((sum,[s,p])=>sum+p.quantity*prices[s],0),total=account.cash+value;$('metrics').innerHTML=[['Portfolio value',money(total)],['Available cash',money(account.cash)],['Invested value',money(value)],['Total return',signed(total-10000)]].map(([label,v])=>`<div class="metric"><span>${label}</span><strong>${v}</strong></div>`).join('');$('watchlist').innerHTML=Object.entries(stocks).map(([s])=>`<button class="stock ${s===symbol?'selected':''}" data-symbol="${s}"><strong>${s}</strong><span>${money(prices[s])}</span></button>`).join('');$('stock-title').textContent=symbol;$('stock-name').textContent=stocks[symbol][0];$('quote').textContent=money(prices[symbol]);const points=history[symbol].slice(-chartWindow),min=Math.min(...points)*.999,max=Math.max(...points)*1.001,coords=points.map((p,i)=>`${i*800/(points.length-1)},${220-(p-min)/(max-min)*200}`).join(' ');$('chart').innerHTML=`<defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#46956b" stop-opacity=".2"/><stop offset="1" stop-color="#46956b" stop-opacity="0"/></linearGradient></defs>${[40,100,160,220].map(y=>`<line x1="0" x2="800" y1="${y}" y2="${y}" stroke="#edf1ec"/>`).join('')}<polygon points="0,240 ${coords} 800,240" fill="url(#fill)"/><polyline points="${coords}" fill="none" stroke="#3e8762" stroke-width="2.5"/>`;$('estimate').textContent=money(prices[symbol]*(Number($('quantity').value)||0));$('positions').innerHTML=Object.entries(account.positions).map(([s,p])=>{const gain=(prices[s]-p.average)*p.quantity;return `<tr><td><strong>${s}</strong></td><td>${p.quantity}</td><td>${money(p.average)}</td><td>${money(p.quantity*prices[s])}</td><td class="${gain>=0?'positive':'negative'}">${signed(gain)}</td></tr>`;}).join('')||'<tr><td colspan="5" class="empty">Your portfolio starts here. Buy a stock to open your first position.</td></tr>';$('history').replaceChildren();if(!account.trades.length){$('history').innerHTML='<div class="empty">No trades yet. Your completed orders will appear here.</div>';}else account.trades.slice(0,20).forEach(t=>{const row=document.createElement('div');row.className='trade-row';const detail=document.createElement('strong');detail.textContent=`${t.side.toUpperCase()} ${t.quantity} ${t.symbol}`;const timestamp=document.createElement('span');timestamp.textContent=new Date(t.time).toLocaleString();const amount=document.createElement('strong');amount.textContent=money(t.quantity*t.price);row.append(detail,timestamp,amount);$('history').append(row);});renderAnalytics();renderChallenges();}
function renderAnalytics(){
 const entries=Object.entries(account.positions).map(([ticker,position])=>({ticker,value:position.quantity*prices[ticker],cost:position.quantity*position.average})).sort((a,b)=>b.value-a.value);
 const invested=entries.reduce((sum,p)=>sum+p.value,0);
 const unrealized=entries.reduce((sum,p)=>sum+p.value-p.cost,0);
 // Weighted-average realized P&L: reconstruct each sale's cost basis from preceding buys.
 const positions={};let realized=0;
 for(const t of [...account.trades].reverse()){
  const old=positions[t.symbol]||{quantity:0,average:0};
  if(t.side==="buy"){const quantity=old.quantity+t.quantity;positions[t.symbol]={quantity,average:(old.quantity*old.average+t.quantity*t.price)/quantity};}
  else if(t.side==="sell"){realized+=(t.price-old.average)*t.quantity;const quantity=old.quantity-t.quantity;positions[t.symbol]=quantity>0?{quantity,average:old.average}:{quantity:0,average:0};}
 }
 const put=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
 put("analytics-unrealized",signed(unrealized));put("analytics-realized",signed(realized));
 put("analytics-largest",entries[0]?.ticker||"None");
 put("analytics-concentration",invested?((entries[0].value/invested)*100).toFixed(1)+"%":"0%");
 const list=$("analytics-allocations");if(!list)return;list.replaceChildren();
 if(!entries.length){list.textContent="Buy a simulated stock to see your allocation.";return;}
 for(const item of entries){const pct=invested?item.value/invested*100:0;const row=document.createElement("div");row.className="allocation-row";const label=document.createElement("span");label.textContent=item.ticker+" · "+pct.toFixed(1)+"%";const track=document.createElement("div");track.className="allocation-track";const bar=document.createElement("div");bar.className="allocation-bar";bar.style.width=pct+"%";track.append(bar);row.append(label,track);list.append(row);}
}
$('watchlist').onclick=e=>{const b=e.target.closest('[data-symbol]');if(b){symbol=b.dataset.symbol;$('symbol').value=symbol;render();}};$('symbol').onchange=()=>{symbol=$('symbol').value;render();};$('quantity').oninput=()=>render();for(const s of ['buy','sell'])$(s).onclick=()=>{side=s;$('buy').classList.toggle('active',s==='buy');$('sell').classList.toggle('active',s==='sell');$('submit').textContent=s==='buy'?'Buy shares':'Sell shares';$('message').textContent='';};$('order-form').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;$('submit').disabled=true;try{const next=trade(account,symbol,side,Number($('quantity').value),prices[symbol]);if(user){if(!cloudReady)throw Error('Your cloud account has not loaded. Sign out to practice as a guest.');await saveAccount(next);}account=next;save();$('message').textContent=storage?'Order filled successfully.':'Order filled. Browser storage is unavailable; progress will not persist.';$('message').className='positive';render();}catch(err){$('message').textContent=err.message;$('message').className='negative';}finally{busy=false;$('submit').disabled=false;}};$('reset').onclick=async()=>{if(busy)return;if(confirm('Reset your cash, positions, and trade history?')){busy=true;try{const next=initialAccount();if(user){if(!cloudReady)throw Error('Your cloud account has not loaded.');await saveAccount(next);}account=next;save();$('message').textContent='Account reset.';render();}catch(err){$('message').textContent=err.message;}finally{busy=false;}}};render();setInterval(()=>{if(priceMode!=='simulation')return;for(const s of Object.keys(stocks)){prices[s]=Math.round(prices[s]*(1+(Math.random()-.5)*.002)*100)/100;history[s].push(prices[s]);history[s].shift();}render();},3000);

function authView(){ $('auth-form').hidden=!!user;$('signout').hidden=!user; }
async function authenticate(create){if(busy)return;if(!$('auth-form').reportValidity())return;busy=true;$('submit').disabled=true;$('reset').disabled=true;try{const email=$('email').value.trim(),password=$('password').value;user=await (create?signUp(email,password):signIn(email,password));$('password').value='';if(!user){$('auth-message').textContent='Check your email to confirm your account, then return here to sign in.';return;}authView();cloudReady=false;account=initialAccount();render();const saved=await loadAccount();if(saved){if(!Number.isFinite(saved.cash)||saved.cash<0||!saved.positions||!Array.isArray(saved.trades)||!Object.entries(saved.positions).every(([s,p])=>stocks[s]&&Number.isInteger(p.quantity)&&p.quantity>0&&Number.isFinite(p.average)))throw Error('Your saved account is invalid.');account=saved;}else await saveAccount(account);cloudReady=true;render();await setLearningUser(true);$('auth-message').textContent=`Signed in as ${user.email} · Portfolio synced. Keep one tab open for trading.`;}catch(err){$('auth-message').textContent=err.message+' If the paper_accounts table is missing, run supabase/schema.sql in the Supabase SQL Editor.';}finally{busy=false;$('submit').disabled=false;$('reset').disabled=false;}}
$('auth-form').onsubmit=e=>{e.preventDefault();authenticate(false);};$('signup').onclick=()=>authenticate(true);
$('signout').onclick=async()=>{if(busy)return;busy=true;try{await signOut();}catch{}finally{user=null;cloudReady=false;account=initialAccount();try{const guest=JSON.parse(localStorage.getItem(key));if(guest&&Number.isFinite(guest.cash)&&guest.positions&&Array.isArray(guest.trades))account=guest;}catch{}authView();render();await setLearningUser(false);$('auth-message').textContent='Guest mode · Progress saved in this browser';busy=false;}};

const chartControls=document.querySelector('.chart-controls');
chartControls?.addEventListener('click',event=>{const button=event.target.closest('[data-window]');if(!button)return;chartWindow=Number(button.dataset.window);chartControls.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));render();});
const quoteStatus=$('quote-status');
function marketStatus(message){quoteStatus.textContent=message;$('market-status').textContent=priceMode==='real'?'● Market quote mode':'● Simulated market';$('chart-mode').textContent=priceMode==='real'?'MARKET QUOTES':'SIMULATED SESSION';$('chart-source').textContent=priceMode==='real'?'Latest provider snapshots, not streaming or historical market charts':'Generated prices • No live market data';}
async function refreshQuotes(){
 if(priceMode!=='real')return;
 quoteStatus.textContent='Fetching market quotes…';
 try{
  const response=await fetch('/api/quotes',{cache:'no-store'});
  const data=await response.json();
  if(!response.ok)throw Error(data.error||'Market quotes unavailable');
  if(!Array.isArray(data.quotes)||data.quotes.length!==Object.keys(stocks).length)throw Error('Incomplete quotes');
  for(const q of data.quotes){if(!stocks[q.symbol]||!Number.isFinite(q.price)||q.price<=0)throw Error('Invalid quote data');}
  for(const q of data.quotes){prices[q.symbol]=q.price;history[q.symbol].push(q.price);history[q.symbol]=history[q.symbol].slice(-120);}
  quoteAsOf=data.quotes.map(q=>q.asOf).sort()[0];
  marketStatus('Market quote snapshots from '+data.source+' · oldest quote timestamp '+new Date(quoteAsOf).toLocaleString()+'. Quotes may be delayed or stale.');render();
 }catch(error){priceMode='simulation';$('price-mode').value='simulation';marketStatus('Market quotes unavailable ('+error.message+'). Simulation resumed.');}
}
$('price-mode').onchange=()=>{priceMode=$('price-mode').value;if(priceMode==='real'){marketStatus('Market quote mode requested.');refreshQuotes();}else marketStatus('Simulation mode: generated prices for practice.');};
$('refresh-quotes').onclick=()=>priceMode==='real'?refreshQuotes():marketStatus('Switch to Market quotes to request a provider snapshot.');
setInterval(()=>{if(priceMode==='real')refreshQuotes();},60000);
function renderChallenges(){
 const trades=account.trades||[],positions=Object.keys(account.positions||{});
 const goals=[
  ['First virtual trade',trades.length>=1,'Make one paper trade'],
  ['Three practice trades',trades.length>=3,'Complete three paper trades'],
  ['Diversified practice portfolio',positions.length>=3,'Hold three different simulated stocks'],
  ['Risk reflection',reviewedTrade,'Use Explain My Trade to review risk']
 ];
 const list=$('challenge-list');if(!list)return;list.replaceChildren();
 goals.forEach(([title,done,description],i)=>{const item=document.createElement('div');item.className='challenge-item';const label=document.createElement('strong');label.textContent=(done?'✓ ':'○ ')+title;const detail=document.createElement('span');detail.textContent=description;item.append(label,detail);list.append(item);});
 const rank=$('personal-ranking');if(rank){rank.textContent='Your private stats: '+trades.length+' trades · '+positions.length+' current holdings · '+money(account.cash+Object.entries(account.positions).reduce((n,[ticker,p])=>n+p.quantity*prices[ticker],0))+' virtual portfolio value.';}
}
$('explain-trade').onclick=()=>{
 const target=$('trade-explanation'),last=account.trades[0];target.replaceChildren();
 if(!last){target.textContent='Make a virtual trade first to receive educational feedback.';return;}
 const total=account.cash+Object.entries(account.positions).reduce((n,[ticker,p])=>n+p.quantity*prices[ticker],0);
 const value=last.quantity*last.price;
 const share=total>0?100*value/total:0;
 const insights=[
  last.side.toUpperCase()+' '+last.quantity+' '+last.symbol+' at '+money(last.price)+' per share ('+money(value)+' total).',
  'This trade notional is about '+share.toFixed(1)+'% of your current portfolio value. Large positions increase exposure to one company.',
  last.side==='buy'?'Buying adds market risk. Consider diversification, your time horizon, and what would invalidate your thesis.':'Selling reduces exposure to this holding; compare the sale with your original plan and cost basis.',
  'Prices '+(priceMode==='real'?'use the latest available market quote snapshots; execution is still simulated.':'are generated by the simulator; outcomes do not predict real markets.'),
  'Reflection: What was your reason for entering or exiting, and what risk limit would you set?'
 ];
 for(const insight of insights){const p=document.createElement('p');p.textContent=insight;target.append(p);}
 reviewedTrade=true;renderChallenges();
};
