export const initialAccount=()=>({cash:10000,positions:{},trades:[]});
export function trade(account,symbol,side,quantity,price){
 if(!['buy','sell'].includes(side)||!['AAPL','MSFT','NVDA','AMZN','GOOGL','TSLA'].includes(symbol)||!Number.isInteger(quantity)||quantity<=0||!Number.isFinite(price)||price<=0)throw Error('Enter a positive whole number of shares.');
 const owned=account.positions[symbol]||{quantity:0,average:0};
 if(side==='buy'&&quantity*price>account.cash)throw Error('Insufficient available cash.');
 if(side==='sell'&&quantity>owned.quantity)throw Error('You cannot sell more shares than you own.');
 const next=structuredClone(account), remaining=owned.quantity+(side==='buy'?quantity:-quantity);
 next.cash+=quantity*price*(side==='buy'?-1:1);
 if(remaining)next.positions[symbol]={quantity:remaining,average:side==='buy'?(owned.quantity*owned.average+quantity*price)/remaining:owned.average};else delete next.positions[symbol];
 next.trades.unshift({symbol,side,quantity,price,time:Date.now()});return next;
}
