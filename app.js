import {signIn,signUp,signOut,loadAccount,saveAccount,getLeaderboardProfile,saveLeaderboardProfile,loadLeaderboard,currentAccessToken} from './supabase.js';
import {initialAccount,trade} from './trading.js';
import {setLearningUser} from './learning.js';
const stocks={AAPL:['Apple Inc.',225],MSFT:['Microsoft Corp.',425],NVDA:['NVIDIA Corp.',135],AMZN:['Amazon.com Inc.',195],GOOGL:['Alphabet Inc.',175],TSLA:['Tesla Inc.',250]};
let user=null,cloudReady=false,busy=false;
const key='paperdesk-account-v1';let account=initialAccount(),storage=true;try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&Number.isFinite(saved.cash)&&saved.cash>=0&&saved.positions&&Array.isArray(saved.trades)&&Object.entries(saved.positions).every(([s,p])=>stocks[s]&&Number.isInteger(p.quantity)&&p.quantity>0&&Number.isFinite(p.average)))account=saved;}catch{storage=false;}
let symbol='AAPL',side='buy',chartWindow=60,priceMode='simulation',quoteAsOf=null,reviewedTrade=false;const prices=Object.fromEntries(Object.entries(stocks).map(([s,v])=>[s,v[1]]));const history=Object.fromEntries(Object.keys(stocks).map(s=>[s,Array.from({length:60},(_,i)=>stocks[s][1]*(1+Math.sin(i/8)*.006+i*.0001))]));const $=id=>document.getElementById(id),money=n=>n.toLocaleString('en-US',{style:'currency',currency:'USD'}),signed=n=>(n>=0?'+':'')+money(n);const save=()=>{if(user)return;try{localStorage.setItem(key,JSON.stringify(account));}catch{storage=false;}};
$('symbol').innerHTML=Object.entries(stocks).map(([s,v])=>`<option value="${s}">${s} — ${v[0]}</option>`).join('');
let equitySeries=[],equityMode=priceMode;
function render(){
 const value=Object.entries(account.positions).reduce((sum,[s,p])=>sum+p.quantity*prices[s],0),total=account.cash+value;
 $('metrics').innerHTML=[['Portfolio value',money(total)],['Available cash',money(account.cash)],['Invested value',money(value)],['Total return',signed(total-10000)]].map(([label,v])=>`<div class="metric"><span>${label}</span><strong>${v}</strong></div>`).join('');
 const search=$('market-search').value.trim().toLowerCase(),visibleStocks=Object.entries(stocks).filter(([ticker,info])=>(ticker+' '+info[0]).toLowerCase().includes(search));
 $('watchlist').innerHTML=visibleStocks.map(([ticker,info])=>{const series=history[ticker],change=(prices[ticker]/series[0]-1)*100;return `<button class="stock ${ticker===symbol?'selected':''}" data-symbol="${ticker}" aria-pressed="${ticker===symbol}"><strong>${ticker}</strong><small>${info[0]}</small><span>${money(prices[ticker])}</span><em class="${change>=0?'positive':'negative'}">${change>=0?'+':''}${change.toFixed(2)}% in chart window</em></button>`;}).join('');
 $('market-search-empty').hidden=visibleStocks.length>0;
 $('stock-title').textContent=symbol;$('stock-name').textContent=stocks[symbol][0];$('quote').textContent=money(prices[symbol]);
 const points=history[symbol].slice(-chartWindow),min=Math.min(...points)*.999,max=Math.max(...points)*1.001,coords=points.map((p,i)=>`${i*800/Math.max(1,points.length-1)},${220-(p-min)/(max-min)*200}`).join(' ');
 $('chart').innerHTML=`<defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#46956b" stop-opacity=".2"/><stop offset="1" stop-color="#46956b" stop-opacity="0"/></linearGradient></defs>${[40,100,160,220].map(y=>`<line x1="0" x2="800" y1="${y}" y2="${y}" stroke="#edf1ec"/>`).join('')}<polygon points="0,240 ${coords} 800,240" fill="url(#fill)"/><polyline points="${coords}" fill="none" stroke="#3e8762" stroke-width="2.5"/>`;
 const quantity=Number($('quantity').value)||0,notional=prices[symbol]*quantity,owned=account.positions[symbol]?.quantity||0;
 $('estimate').textContent=money(notional);$('order-cash').textContent=money(account.cash);$('order-owned').textContent=owned;
 $('order-impact').textContent=quantity<=0||!Number.isInteger(quantity)?'Enter a positive whole number of shares.':side==='buy'&&notional>account.cash?'This order exceeds your available cash.':side==='sell'&&quantity>owned?'You can sell up to '+owned+' shares of '+symbol+'.':(side==='buy'?'Cash after purchase: '+money(account.cash-notional):'Cash after sale: '+money(account.cash+notional))+' · Position after order: '+(owned+(side==='buy'?quantity:-quantity))+' shares.';
 $('positions').innerHTML=Object.entries(account.positions).map(([ticker,p])=>{const gain=(prices[ticker]-p.average)*p.quantity;return `<tr><td><strong>${ticker}</strong><small class="holding-name">${stocks[ticker][0]}</small></td><td>${p.quantity}</td><td>${money(p.average)}</td><td>${money(prices[ticker])}</td><td>${money(p.quantity*prices[ticker])}</td><td class="${gain>=0?'positive':'negative'}">${signed(gain)}<small class="holding-name">${(gain/(p.quantity*p.average)*100).toFixed(2)}%</small></td><td>${total?(p.quantity*prices[ticker]/total*100).toFixed(1):'0.0'}%</td><td><button type="button" class="holding-trade secondary" data-trade="${ticker}" aria-label="Trade ${ticker}">Trade</button></td></tr>`;}).join('')||'<tr><td colspan="8" class="empty">Your portfolio starts here. Choose a stock and make your first practice trade.</td></tr>';
 $('history').replaceChildren();const filter=$('history-filter').value,trades=account.trades.filter(t=>filter==='all'||t.side===filter);
 if(!trades.length){$('history').innerHTML='<div class="empty">'+(account.trades.length?'No '+filter+' orders yet.':'No trades yet. Your completed orders will appear here.')+'</div>';}
 else trades.slice(0,20).forEach(t=>{const row=document.createElement('div');row.className='trade-row';const detail=document.createElement('strong');detail.textContent=`${t.side.toUpperCase()} ${t.quantity} ${t.symbol}`;detail.className=t.side==='buy'?'positive':'negative';const timestamp=document.createElement('span');timestamp.textContent=new Date(t.time).toLocaleString();const amount=document.createElement('strong');amount.textContent=money(t.quantity*t.price);row.append(detail,timestamp,amount);$('history').append(row);});
 renderDesk(total,value);renderAnalytics();renderChallenges();
}
function renderDesk(total,invested){
 if(equityMode!==priceMode){equitySeries=[];equityMode=priceMode;}
 const last=equitySeries.at(-1);if(!last||Math.abs(last.value-total)>.005)equitySeries.push({value:total,time:Date.now()});equitySeries=equitySeries.slice(-120);
 const values=equitySeries.map(p=>p.value),low=Math.min(...values)-1,high=Math.max(...values)+1;
 const coords=values.length===1?`0,90 800,90`:values.map((v,i)=>`${i*800/(values.length-1)},${160-(v-low)/(high-low)*140}`).join(' ');
 $('equity-chart').innerHTML=`${[20,90,160].map(y=>`<line x1="0" x2="800" y1="${y}" y2="${y}" stroke="#e9eee9"/>`).join('')}<polyline points="${coords}" fill="none" stroke="#24875a" stroke-width="3"/>`;
 $('desk-equity').textContent=money(total);$('desk-return').textContent=(total>=10000?'+':'')+((total-10000)/100).toFixed(2)+'% since starting balance';$('desk-return').className=total>=10000?'positive':'negative';
 $('equity-start').textContent='Observed since '+new Date(equitySeries[0].time).toLocaleTimeString();
 const investedPercent=total>0?invested/total*100:0;$('desk-invested-percent').textContent=investedPercent.toFixed(0)+'%';$('allocation-ring').style.background=`conic-gradient(#24875a 0% ${investedPercent}%, #e4ede7 ${investedPercent}% 100%)`;
 $('desk-cash').textContent=money(account.cash);$('desk-stocks').textContent=money(invested);
 const holdings=Object.entries(account.positions),largest=holdings.reduce((best,[ticker,p])=>Math.max(best,p.quantity*prices[ticker]),0),weight=total?largest/total*100:0;
 $('desk-risk').textContent=holdings.length===0?'Your practice portfolio is all cash. Explore a stock below to get started.':weight>50?'Your largest holding is '+weight.toFixed(0)+'% of your portfolio. Explore how concentration affects risk.':holdings.length+' holding'+(holdings.length===1?'':'s')+' · '+(100-investedPercent).toFixed(0)+'% held in cash. Diversification can reduce dependence on one company.';
}
$('market-search').addEventListener('input',render);$('history-filter').addEventListener('change',render);
$('positions').addEventListener('click',event=>{const b=event.target.closest('[data-trade]');if(!b)return;symbol=b.dataset.trade;$('symbol').value=symbol;render();document.querySelector('.order').scrollIntoView({block:'center'});$('quantity').focus();});
document.querySelector('.size-shortcuts').addEventListener('click',event=>{const b=event.target.closest('[data-size]');if(!b)return;$('quantity').value=b.dataset.size;render();});
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
$('watchlist').onclick=e=>{const b=e.target.closest('[data-symbol]');if(b){symbol=b.dataset.symbol;$('symbol').value=symbol;render();}};$('symbol').onchange=()=>{symbol=$('symbol').value;render();};$('quantity').oninput=()=>render();for(const s of ['buy','sell'])$(s).onclick=()=>{side=s;$('buy').classList.toggle('active',s==='buy');$('sell').classList.toggle('active',s==='sell');$('submit').textContent=s==='buy'?'Buy shares':'Sell shares';$('message').textContent='';$('buy').setAttribute('aria-pressed',s==='buy');$('sell').setAttribute('aria-pressed',s==='sell');render();};$('order-form').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;$('submit').disabled=true;try{const next=trade(account,symbol,side,Number($('quantity').value),prices[symbol]);if(user){if(!cloudReady)throw Error('Your cloud account has not loaded. Sign out to practice as a guest.');await saveAccount(next);}account=next;save();$('message').textContent=storage?'Order filled successfully.':'Order filled. Browser storage is unavailable; progress will not persist.';$('message').className='positive';render();}catch(err){$('message').textContent=err.message;$('message').className='negative';}finally{busy=false;$('submit').disabled=false;}};$('reset').onclick=async()=>{if(busy)return;if(confirm('Reset your cash, positions, and trade history?')){busy=true;try{const next=initialAccount();if(user){if(!cloudReady)throw Error('Your cloud account has not loaded.');await saveAccount(next);}account=next;equitySeries=[];save();$('message').textContent='Account reset.';render();}catch(err){$('message').textContent=err.message;}finally{busy=false;}}};render();setInterval(()=>{if(priceMode!=='simulation')return;for(const s of Object.keys(stocks)){prices[s]=Math.round(prices[s]*(1+(Math.random()-.5)*.002)*100)/100;history[s].push(prices[s]);history[s]=history[s].slice(-120);}render();},3000);

function authView(){ $('auth-form').hidden=!!user;$('signout').hidden=!user; }
async function authenticate(create){if(busy)return;if(!$('auth-form').reportValidity())return;busy=true;$('submit').disabled=true;$('reset').disabled=true;try{const email=$('email').value.trim(),password=$('password').value;user=await (create?signUp(email,password):signIn(email,password));$('password').value='';if(!user){$('auth-message').textContent='Check your email to confirm your account, then return here to sign in.';return;}authView();cloudReady=false;account=initialAccount();equitySeries=[];render();await setLearningUser(true);const saved=await loadAccount();if(saved){if(!Number.isFinite(saved.cash)||saved.cash<0||!saved.positions||!Array.isArray(saved.trades)||!Object.entries(saved.positions).every(([s,p])=>stocks[s]&&Number.isInteger(p.quantity)&&p.quantity>0&&Number.isFinite(p.average)))throw Error('Your saved account is invalid.');account=saved;}else await saveAccount(account);cloudReady=true;render();await initLeaderboard();$('auth-message').textContent=`Signed in as ${user.email} · Portfolio synced. Keep one tab open for trading.`;}catch(err){$('auth-message').textContent=err.message+' If the paper_accounts table is missing, run supabase/schema.sql in the Supabase SQL Editor.';}finally{busy=false;$('submit').disabled=false;$('reset').disabled=false;}}
$('auth-form').onsubmit=e=>{e.preventDefault();authenticate(false);};$('signup').onclick=()=>authenticate(true);
$('signout').onclick=async()=>{if(busy)return;busy=true;try{await signOut();}catch{}finally{user=null;cloudReady=false;equitySeries=[];account=initialAccount();try{const guest=JSON.parse(localStorage.getItem(key));if(guest&&Number.isFinite(guest.cash)&&guest.positions&&Array.isArray(guest.trades))account=guest;}catch{}authView();render();await setLearningUser(false);$('leaderboard-results').replaceChildren();$('leaderboard-status').textContent='Sign in to participate. Participation is optional.';$('auth-message').textContent='Guest mode · Progress saved in this browser';busy=false;}};

const chartControls=document.querySelector('.chart-controls');
chartControls?.addEventListener('click',event=>{const button=event.target.closest('[data-window]');if(!button)return;chartWindow=Number(button.dataset.window);chartControls.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===button));render();});
const quoteStatus=$('quote-status');let quoteGeneration=0,chartPriceMode='simulation';
function marketStatus(message){quoteStatus.textContent=message;$('market-status').textContent=priceMode==='real'?'● Market quote mode':'● Simulated market';$('chart-mode').textContent=priceMode==='real'?'MARKET QUOTES':'SIMULATED SESSION';$('chart-source').textContent=priceMode==='real'?'Latest provider snapshots, not streaming or historical market charts':'Generated prices • No live market data';}
async function refreshQuotes(){
 if(priceMode!=='real')return;
 const generation=++quoteGeneration;
 quoteStatus.textContent='Fetching market quotes…';
 try{
  const response=await fetch('/api/quotes',{cache:'no-store'});
  const data=await response.json();
  if(generation!==quoteGeneration||priceMode!=='real')return;
  if(!response.ok)throw Error(data.error||'Market quotes unavailable');
  if(!Array.isArray(data.quotes)||data.quotes.length!==Object.keys(stocks).length||new Set(data.quotes.map(q=>q.symbol)).size!==Object.keys(stocks).length)throw Error('Incomplete quotes');
  for(const q of data.quotes){if(!stocks[q.symbol]||!Number.isFinite(q.price)||q.price<=0||!Number.isFinite(Date.parse(q.asOf)))throw Error('Invalid quote data');}
  for(const q of data.quotes){if(chartPriceMode!=='real')history[q.symbol]=[q.price];prices[q.symbol]=q.price;history[q.symbol].push(q.price);history[q.symbol]=history[q.symbol].slice(-120);}chartPriceMode='real';
  quoteAsOf=data.quotes.map(q=>q.asOf).sort()[0];
  marketStatus('Market quote snapshots from '+data.source+' · oldest quote timestamp '+new Date(quoteAsOf).toLocaleString()+'. Quotes may be delayed or stale.');render();
 }catch(error){if(generation!==quoteGeneration||priceMode!=='real')return;chartPriceMode='simulation';priceMode='simulation';$('price-mode').value='simulation';for(const ticker of Object.keys(stocks))history[ticker]=[prices[ticker]];marketStatus('Market quotes unavailable ('+error.message+'). Simulation resumed.');render();}
}
$('price-mode').onchange=()=>{++quoteGeneration;priceMode=$('price-mode').value;if(priceMode==='real'){marketStatus('Market quote mode requested.');refreshQuotes();}else{chartPriceMode='simulation';for(const ticker of Object.keys(stocks))history[ticker]=[prices[ticker]];marketStatus('Simulation mode: generated prices for practice.');render();}};
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

async function initLeaderboard(){
 try{const profile=await getLeaderboardProfile();$('leaderboard-name').value=profile?.display_name||'';$('leaderboard-optin').checked=!!profile?.opted_in;$('leaderboard-status').textContent=profile?.opted_in?'You are opted in. Your nickname and XP can appear publicly.':'You are not listed publicly.';}
 catch{$('leaderboard-status').textContent='Community rankings are not available yet. Your personal learning progress is still saved.';}
}
$('leaderboard-save').onclick=async()=>{
 if(!user){$('leaderboard-status').textContent='Sign in first.';return;}
 const name=$('leaderboard-name').value.trim(),optedIn=$('leaderboard-optin').checked;
 if(!/^[A-Za-z0-9_ ]{3,24}$/.test(name)){$('leaderboard-status').textContent='Choose 3–24 letters, numbers, underscores or spaces.';return;}
 try{await saveLeaderboardProfile(name,optedIn);$('leaderboard-status').textContent=optedIn?'Opted in. Your nickname and XP may be visible to other signed-in learners.':'Saved. You are not publicly listed.';}
 catch(error){$('leaderboard-status').textContent='Could not save preference: '+error.message;}
};
$('leaderboard-refresh').onclick=async()=>{
 const list=$('leaderboard-results');list.replaceChildren();
 if(!user){$('leaderboard-status').textContent='Sign in to view rankings.';return;}
 try{const rows=await loadLeaderboard();if(!rows.length){$('leaderboard-status').textContent='No opted-in learners yet.';return;}for(const row of rows){const li=document.createElement('li');li.textContent=row.display_name+' · '+row.xp+' XP';list.append(li);}$('leaderboard-status').textContent='Top opted-in learners (XP is self-reported learning progress).';}
 catch(error){$('leaderboard-status').textContent='Leaderboard unavailable: '+error.message;}
};
$('ai-explain-trade').onclick=async()=>{
 const output=$('ai-trade-explanation'),last=account.trades[0];
 if(!last){output.textContent='Make a virtual trade first.';return;}
 if(!user){output.textContent='Sign in to use the optional AI coach. The built-in coach works for guests.';return;}
 output.textContent='Asking AI coach…';$('ai-explain-trade').disabled=true;
 try{const response=await fetch('/api/trade-coach',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+currentAccessToken()},body:JSON.stringify({symbol:last.symbol,side:last.side,quantity:last.quantity,price:last.price})});const data=await response.json();if(!response.ok)throw Error(data.error||'AI unavailable');output.textContent=data.explanation+' Educational only; not financial advice.';}
 catch(error){output.textContent=error.message+' Use Explain My Trade for the offline educational version.';}
 finally{$('ai-explain-trade').disabled=false;}
};
