export interface BudgetConfig {initialCash:number;monthlyGross:number;taxRate:number;rent:number;essentials:number;apr:number}
export interface BudgetDecision {save:number;repay:number;spend:number}
export interface BudgetGame {config:BudgetConfig;decisions:BudgetDecision[]}
export const defaultBudgetConfig:BudgetConfig={initialCash:500,monthlyGross:2800,taxRate:20,rent:950,essentials:650,apr:24};
export const budgetEvents=[
 {title:'Settle into a routine',cost:0,lesson:'Map recurring bills before choosing flexible spending.'},
 {title:'An essential repair',cost:180,lesson:'An accessible reserve can reduce the need to borrow.'},
 {title:'Annual account fee',cost:60,lesson:'Check account disclosures for fees and alternatives.'},
 {title:'A small work bonus',cost:-120,lesson:'An extra payment can support savings or debt repayment.'},
 {title:'A medical co-payment',cost:90,lesson:'Insurance can still leave out-of-pocket costs.'},
 {title:'A utility adjustment',cost:75,lesson:'Review estimates against actual bills.'},
 {title:'Replace a required device',cost:300,lesson:'Distinguish essential replacements from optional upgrades.'},
 {title:'Quiet month',cost:0,lesson:'A month without surprises is an opportunity to rebuild reserves.'},
 {title:'Annual transport expense',cost:150,lesson:'Predictable annual expenses deserve a sinking fund.'},
 {title:'A refund arrives',cost:-80,lesson:'A refund is not a reason to permanently increase recurring spending.'},
 {title:'Urgent travel',cost:220,lesson:'Liquidity matters when a necessary expense cannot wait.'},
 {title:'Review the year',cost:0,lesson:'Compare the plan, actual outcomes and what you would change.'}
] as const;
const money=(n:number)=>Math.round(n*100)/100;
export function budgetMonth(game:BudgetGame){
 let cash=game.config.initialCash,savings=0,debt=0,totalInterest=0;
 const history:{month:number;cash:number;savings:number;debt:number;netWorth:number;interest:number;event:string}[]=[];
 for(let i=0;i<=game.decisions.length&&i<12;i++){
  const interest=money(debt*game.config.apr/1200);debt=money(debt+interest);totalInterest=money(totalInterest+interest);
  cash=money(cash+game.config.monthlyGross*(1-game.config.taxRate/100)-game.config.rent-game.config.essentials-budgetEvents[i].cost);
  if(cash<0){const used=Math.min(savings,-cash);savings=money(savings-used);cash=money(cash+used);if(cash<0){debt=money(debt-cash);cash=0;}}
  const decision=game.decisions[i];
  if(!decision)return {cash,savings,debt,totalInterest,history,month:i+1,interest,event:budgetEvents[i],complete:false};
  if(decision.save+decision.repay+decision.spend>cash+.001||decision.repay>debt+.001)throw new Error('Your choices exceed available cash or debt.');
  cash=money(cash-decision.save-decision.repay-decision.spend);savings=money(savings+decision.save);debt=money(debt-decision.repay);
  history.push({month:i+1,cash,savings,debt,netWorth:money(cash+savings-debt),interest,event:budgetEvents[i].title});
 }
 return {cash,savings,debt,totalInterest,history,month:12,interest:0,event:budgetEvents[11],complete:true};
}
export function isBudgetGame(value:unknown):value is BudgetGame{
 if(!value||typeof value!=='object')return false;const game=value as BudgetGame,c=game.config;
 if(!c||typeof c!=='object'||!Array.isArray(game.decisions)||game.decisions.length>12)return false;
 const ranges={initialCash:1000000,monthlyGross:100000,rent:100000,essentials:100000,taxRate:80,apr:100};
 for(const [key,max] of Object.entries(ranges)){const v=c[key as keyof BudgetConfig];if(!Number.isFinite(v)||v<0||v>max)return false;}
 for(const d of game.decisions)if(!d||['save','repay','spend'].some(k=>!Number.isFinite(d[k as keyof BudgetDecision])||d[k as keyof BudgetDecision]<0||d[k as keyof BudgetDecision]>10000000))return false;
 try{budgetMonth(game);return true;}catch{return false;}
}
