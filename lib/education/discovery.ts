export const glossary=[
 ['VWAP','Volume-weighted average price: the average price paid during a period, weighted by shares traded.','100 shares at $10 and 300 at $12 produce VWAP $11.50.',57],
 ['Pullback','A temporary move against an existing trend. It may develop into a reversal.','Price rises 95 → 101, then falls to 99. The dip is a pullback until the broader trend changes.',145],
 ['Liquidity','How readily an asset can be traded without substantially moving its price.','A narrow spread and many available orders may help execution, but can change quickly.',34],
 ['Bullish','Expecting prices to rise over a stated timeframe; not a guarantee.','A trader may be bullish over months while expecting a short-term decline.',144],
 ['Bearish','Expecting prices to fall over a stated timeframe.','A bearish view needs evidence and a timeframe, not just a red candle.',144],
 ['Spread','The difference between the best quoted ask and bid.','Ask $100.10 minus bid $99.90 = $0.20 spread.',50],
 ['Stop loss','An order intended to exit after a price trigger. Execution and price are not guaranteed.','A gap below a $95 stop may result in a fill below $95.',40],
 ['Position size','The number of shares or units held in a trade.','A $50 planned risk divided by a $2 entry-to-stop distance gives 25 shares before costs.',51],
 ['Resistance','An observed price area where selling previously slowed a rise. It can break.','Several reactions around $110 suggest an area to watch, not a ceiling.',17],
 ['Support','An observed price area where buying previously slowed a decline. It can break.','Previous bounces near $100 do not guarantee the next bounce.',17],
 ['Volume','The number of shares or units traded during a period.','A busier session has more transactions; volume alone does not tell you the next direction.',19],
 ['ETF','An exchange-traded fund: a basket of investments traded in shares.','A broad stock ETF may hold many businesses, while a sector ETF may be concentrated.',21],
 ['Diversification','Spreading exposure across investments whose risks are not identical.','Two funds holding the same companies can overlap heavily.',22],
 ['FOMO','Fear of missing out: pressure to act because others appear to be benefiting.','Chasing a rapid rise without a plan is a common FOMO response.',45],
 ['Drawdown','The fall from a portfolio’s previous peak to a later lower value.','A fall from $10,000 to $9,000 is a 10% drawdown.',46],
 ['R multiple','A trade result divided by its planned initial risk.','A $100 gain on $50 planned risk is +2R before costs.',43],
 ['Market order','An order seeking prompt execution at available prices.','Your fill may differ from the displayed quote.',12],
 ['Limit order','An order specifying the maximum buy or minimum sell price; it may not fill.','A $100 buy limit can fill at $100 or less, if execution is available.',13],
 ['Candlestick','A chart mark showing a period’s open, high, low, and close.','A green body can mean close above open, but does not promise another increase.',26],
 ['Compound interest','Interest or returns that themselves can earn interest or returns.','At a hypothetical fixed 5%, $1,000 grows to $1,050 then $1,102.50. Market returns are not fixed.',61],
] as const;
export const mistakes=[
 {name:'Overtrading',problem:'Repeated trades without a fresh reason can increase costs and poor decisions.',fix:'Write an entry condition and a session trade limit. Stopping is a valid choice.',scenario:'You have already taken your planned three trades. A fourth setup is unclear. What now?',options:['Keep trading until you make more','Pause and review your plan'],answer:1,lesson:45,prices:[100,101,99,102,100,101,99]},
 {name:'Entering too late',problem:'Chasing a move can leave a large potential loss compared with the remaining opportunity.',fix:'Recheck entry, invalidation, and size. Skip if the original plan no longer fits.',scenario:'Price has run far beyond your planned entry. Which choice fits a disciplined process?',options:['Reassess the plan and consider skipping','Buy more so you do not miss out'],answer:0,lesson:137,prices:[95,96,98,99,103,108,111]},
 {name:'No exit or risk plan',problem:'A position without a defined loss limit can become an uncontrolled bet.',fix:'Choose a practical invalidation point and affordable size. Stops can slip or gap.',scenario:'You cannot explain how much a trade could lose. What comes first?',options:['Enter and figure it out later','Define risk before entering'],answer:1,lesson:40,prices:[105,104,102,99,97,94,91]},
 {name:'Revenge trading',problem:'Trying to immediately recover a loss can turn frustration into oversized risk.',fix:'Take a break, record the emotion, and review the next decision separately.',scenario:'You lost a trade and want to double the next position to recover. What helps?',options:['Pause, journal, and return to your normal risk plan','Double down before you calm down'],answer:0,lesson:45,prices:[100,102,99,96,98,94,93]},
 {name:'FOMO entries',problem:'A fast move or social post can create urgency without a researched reason.',fix:'Separate evidence from excitement. No trade is better than an unplanned trade.',scenario:'A post promises a stock will soar. You have not researched it. What do you do?',options:['Buy immediately because everyone is excited','Check reliable sources and define a plan first'],answer:1,lesson:142,prices:[98,99,100,104,109,105,100]},
];
export function dailyWarmupIndex(date:Date){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const value=(type:string)=>parts.find(p=>p.type===type)!.value;return Math.floor(Date.UTC(Number(value('year')),Number(value('month'))-1,Number(value('day')))/86400000)%3;}
export const warmups=[
 {title:'A pullback within a rising trend',prices:[95,97,96,99,98,102,100],level:100,annotation:'Recent pullback',why:'A dip can offer a place to reassess a trend, but can also become a reversal.',look:'Compare the bigger trend, a possible invalidation point, and affordable risk.',lesson:145},
 {title:'Resistance and a possible breakout',prices:[98,100,99,102,101,104,105],level:104,annotation:'Observed resistance',why:'An observed level helps organize a question. Moving above it does not prove the breakout will last.',look:'Watch for follow-through and failed moves. Plan what would change your view.',lesson:147},
 {title:'Support under pressure',prices:[106,104,102,100,103,101,99],level:100,annotation:'Observed support',why:'Repeated reactions make an area interesting, but support can fail.',look:'Ask whether the previous observation still holds. Waiting is an option.',lesson:146},
];
