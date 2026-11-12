export function loanPayment(principal:number,annualRate:number,months:number){const r=annualRate/1200;return r===0?principal/months:principal*r/(1-Math.pow(1+r,-months));}
export function savingsProjection(initial:number,monthly:number,annualRate:number,years:number){let balance=initial;const rows=[];for(let year=1;year<=years;year++){for(let m=0;m<12;m++)balance=balance*(1+annualRate/1200)+monthly;rows.push({year,balance,contributed:initial+monthly*12*year});}return rows;}
export function spendingStats(values:number[]){if(!values.length)return null;const sorted=[...values].sort((a,b)=>a-b),n=sorted.length;return {total:values.reduce((a,b)=>a+b,0),mean:values.reduce((a,b)=>a+b,0)/n,median:n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2,min:sorted[0],max:sorted[n-1]};}
export function housingProjection({price,downPercent,rate,termYears,rent,ownerMonthly,appreciation,rentGrowth,investmentReturn,years,saleCost}:{price:number;downPercent:number;rate:number;termYears:number;rent:number;ownerMonthly:number;appreciation:number;rentGrowth:number;investmentReturn:number;years:number;saleCost:number}){
 const down=price*downPercent/100,principal=price-down,payment=loanPayment(principal,rate,termYears*12);let debt=principal,home=price,renterInvestments=down,ownerInvestments=0,currentRent=rent;const rows=[];
 for(let year=1;year<=years;year++){
  for(let m=0;m<12;m++){
   const interest=debt*rate/1200,actualPayment=debt>0?Math.min(payment,debt+interest):0;debt=Math.max(0,debt+interest-actualPayment);
   const ownerCost=actualPayment+ownerMonthly,difference=ownerCost-currentRent;
   renterInvestments=renterInvestments*(1+investmentReturn/1200)+Math.max(0,difference);
   ownerInvestments=ownerInvestments*(1+investmentReturn/1200)+Math.max(0,-difference);
  }
  home*=1+appreciation/100;rows.push({year,buyerNet:home*(1-saleCost/100)-debt+ownerInvestments,renterNet:renterInvestments,debt});currentRent*=1+rentGrowth/100;
 }
 return {payment,down,rows};
}
