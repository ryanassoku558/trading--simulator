import type { Achievement, Lesson, State } from "@/types";
import { expandedModules, expandedLessons } from "./expanded";
import { beginnerLearningOrder as coreLearningOrder } from "./dayTrading";
import { indicatorLessons } from "./indicators";
import { dayTradingLessons } from "./dayTrading";
export { accountRulesMetadata } from "./dayTrading";
export { expandedModules } from "./expanded";
export const beginnerLearningOrder=[...coreLearningOrder,...expandedLessons.map(l=>l.id)];
export const levels = [
  "Trading Basics",
  "Understanding Prices",
  "Placing Trades",
  "Reading Charts",
  "Building a Portfolio",
  "Candlestick Practice",
  "Day Trading Foundations",
  "Execution, Accounts & Risk",
  "Planning, Emotions & Reality",
  "Real-World Trading Context",
  "Beginner Practice Lab",
  "Indicators Explained",
  ...expandedModules.map(m=>m.title),
];
const content = [
  [
    "What is a stock?",
    "A stock is a small piece of ownership in a company. A share is one unit of that ownership.",
    "Buying one Apple share makes you a tiny part-owner of Apple.",
    "You are buying ownership, not a guarantee that your money will grow.",
    "What does a share represent?",
    "A small piece of a company",
    "A guaranteed profit",
    "A loan to a friend",
  ],
  [
    "Why do stock prices move?",
    "Prices change as buyers and sellers react to news, results, and expectations. More demand can push prices up.",
    "Strong earnings may attract buyers. Disappointing news may attract sellers.",
    "Price changes reflect expectations and uncertainty.",
    "What can move a stock price?",
    "Company news and investor demand",
    "Only the company logo",
    "Your account balance",
  ],
  [
    "What does buying a stock mean?",
    "You exchange cash for shares. Your cash decreases and your holdings increase.",
    "Two shares at $100 each cost $200.",
    "The money in a stock can go up or down in value.",
    "Two shares at $100 cost how much?",
    "$200",
    "$100",
    "$50",
  ],
  [
    "What does selling mean?",
    "Selling exchanges your shares for cash. Your gain or loss depends on the sale price compared with what you paid.",
    "Buy at $100, sell at $90: you lose $10 per share.",
    "A sale turns an unrealized result into a realized one.",
    "Sell at $90 after buying at $100: what happens?",
    "A $10 loss per share",
    "A $10 gain per share",
    "No change",
  ],
  [
    "Profit and loss",
    "Profit is money gained. Loss is money lost. Percentage return compares the change with the starting price.",
    "A move from $100 to $110 is a $10 gain, or 10%.",
    "Percentages help compare investments of different sizes.",
    "If $100 rises to $110, what happened?",
    "You gained 10%",
    "You lost 10%",
    "You doubled your money",
  ],
  [
    "Share price",
    "The share price is the cost of one share. A low price does not automatically mean a bargain.",
    "Five shares at $20 cost the same as one share at $100.",
    "Compare the business, not just the price tag.",
    "Does a lower share price always mean better value?",
    "No",
    "Yes",
    "Only on Mondays",
  ],
  [
    "Market capitalization",
    "Market capitalization is the total value of a company’s shares: price times shares outstanding.",
    "One million shares at $10 means a $10 million market cap.",
    "It helps describe a company’s size.",
    "How is market cap calculated?",
    "Price × shares outstanding",
    "Price × your cash",
    "Volume ÷ price",
  ],
  [
    "Percentage gains and losses",
    "Percentage change is the change divided by the starting value, times 100.",
    "From $50 to $55: $5 ÷ $50 × 100 = 10%.",
    "Equal percentage gains and losses do not cancel each other out.",
    "From $50 to $55 is what gain?",
    "10%",
    "5%",
    "50%",
  ],
  [
    "Bid and ask",
    "The bid is what a buyer offers. The ask is what a seller requests. The gap is the spread.",
    "A $99.90 bid and $100 ask have a $0.10 spread.",
    "Wide spreads can make trading more expensive.",
    "What is the ask?",
    "A seller’s requested price",
    "Your account password",
    "Yesterday’s price",
  ],
  [
    "Volume",
    "Volume counts how many shares trade during a period. It measures activity, not a promise of direction.",
    "One million shares traded today means volume of one million.",
    "Low activity can make it harder to trade at the price you expect.",
    "What does volume measure?",
    "Shares traded",
    "Company profit",
    "Your total cash",
  ],
  [
    "Market orders",
    "A market order trades at the available price. In this simulation it fills immediately at the displayed quote.",
    "One share quoted at $200 costs $200 in this simulator.",
    "Real market prices can move before an order fills.",
    "What does a market order prioritize?",
    "Executing the trade",
    "A guaranteed future price",
    "Waiting forever",
  ],
  [
    "Limit orders",
    "A limit order sets your maximum buy price or minimum sell price. It may never execute.",
    "A $190 buy limit waits until the simulated quote is $190 or less.",
    "You control the price condition, but not whether it fills.",
    "A $190 buy limit can fill at which price?",
    "$189",
    "$195",
    "$200",
  ],
  [
    "Stop-loss basics",
    "A stop order activates when a trigger price is reached. Its eventual execution price may differ from the trigger.",
    "A stop at $90 may activate after a drop, but a fast move can fill below $90.",
    "Stops do not guarantee a maximum loss. This MVP teaches stops but only offers market and limit orders.",
    "Does a stop guarantee its trigger price?",
    "No",
    "Yes",
    "Only for expensive stocks",
  ],
  [
    "Position size",
    "Position size is how much of your portfolio is in an investment.",
    "A $400 position in a $10,000 account is 4%.",
    "A larger position makes each price move affect your account more.",
    "What is $400 of $10,000?",
    "4%",
    "40%",
    "0.4%",
  ],
  [
    "Risk",
    "Risk is the possibility that results differ from what you expect, including losing money.",
    "A $100 share falling 10% loses $10 of value.",
    "Practice understanding possible losses before focusing on gains.",
    "Can stock investments lose value?",
    "Yes",
    "Never",
    "Only after selling",
  ],
  [
    "Price charts",
    "A price chart shows how a price changed over time. It describes the past, not the future.",
    "A line rising from $90 to $100 shows a past increase.",
    "Charts help you see movement without predicting certainty.",
    "What does a chart show?",
    "Past prices",
    "Guaranteed future prices",
    "Your password",
  ],
  [
    "Timeframes",
    "A timeframe chooses how much history a chart displays. The same stock can look different over a day and a year.",
    "A stock can fall today while still being up over a year.",
    "Use the timeframe that matches the question you are asking.",
    "Can daily and yearly trends differ?",
    "Yes",
    "No",
    "Only for funds",
  ],
  [
    "Candlesticks",
    "A candle summarizes the open, high, low, and close during a period. The body shows open to close.",
    "Open $100, close $105: the candle shows a rise during that period.",
    "Candles give more detail than a single closing price.",
    "What does a candle summarize?",
    "Open, high, low, close",
    "Only company revenue",
    "Only volume",
  ],
  [
    "Trends",
    "A trend is a general direction over time. Uptrends have generally rising prices; downtrends have generally falling prices.",
    "A series of higher highs and higher lows may indicate an uptrend.",
    "A trend can change at any time.",
    "Does an uptrend guarantee more gains?",
    "No",
    "Yes",
    "For exactly one year",
  ],
  [
    "Support and resistance",
    "Support is an area where buying has previously slowed declines. Resistance is an area where selling has slowed rises.",
    "Prices repeatedly bouncing near $100 can suggest support there.",
    "These are observations, not barriers that prices cannot cross.",
    "Can support levels break?",
    "Yes",
    "Never",
    "Only at night",
  ],
  [
    "Diversification",
    "Diversification spreads investments across different businesses or assets.",
    "Owning companies across several industries reduces reliance on one company.",
    "It can reduce concentration risk, but cannot remove all risk.",
    "What is diversification?",
    "Spreading investments",
    "Putting everything in one stock",
    "Avoiding all price changes",
  ],
  [
    "Risk vs reward",
    "Higher possible reward often comes with greater uncertainty and possible loss.",
    "A volatile stock may rise sharply or fall sharply.",
    "Compare potential losses along with potential gains.",
    "Higher potential reward usually involves what?",
    "More uncertainty",
    "Guaranteed profit",
    "No losses",
  ],
  [
    "Long-term investing",
    "Long-term investing means holding assets over years while considering business performance and your goals.",
    "A long-term investor may focus on business growth rather than hourly changes.",
    "Time does not guarantee profit; patience still requires thoughtful review.",
    "Does holding longer guarantee a profit?",
    "No",
    "Yes",
    "After exactly 30 days",
  ],
  [
    "Portfolio allocation",
    "Allocation describes how your total account is divided between cash and investments.",
    "$2,000 in stock and $8,000 cash is a 20% stock allocation.",
    "Allocation makes concentration visible.",
    "What is $2,000 of $10,000?",
    "20%",
    "2%",
    "80%",
  ],
  [
    "Reviewing performance",
    "Review your overall return, risk, and process, rather than judging one trade alone.",
    "A $10,000 account becoming $10,500 has a 5% total return.",
    "A good review includes mistakes and what you learned.",
    "A $500 gain on $10,000 is what return?",
    "5%",
    "50%",
    "0.5%",
  ],
  [
    "Candle bodies and wicks",
    "Each candle summarizes one period. Open is its first price, close its last price, high its highest price, and low its lowest price. The body connects open and close; the thin wicks extend to high and low.",
    "Open $100, high $108, low $97, close $105: the body runs from $100 to $105, with wicks up to $108 and down to $97. Switch to Candlesticks on a stock page and inspect a period.",
    "Reading all four prices tells you more than seeing the closing price alone. These practice candles are simulated examples.",
    "A candle opens at $100 and closes at $105. What does its body connect?",
    "$100 and $105",
    "$97 and $108",
    "Only the highest price",
  ],
  [
    "Green, red, and price gaps",
    "In Sprout, a green filled candle closes above its own open. A red hollow candle closes below its own open. Other chart platforms may use different colors. A gap occurs when a period opens away from the previous period’s close.",
    "Yesterday closed at $110. Today opens at $100 and closes at $104: today’s candle is green, even though its close is $6 below yesterday’s close.",
    "Candle color compares open and close within one period, not necessarily the change from the previous close. Sprout’s generated candles join consecutive periods; the example below separately illustrates a gap.",
    "Previous close $110; next open $100 and close $104. What color is the next candle in Sprout?",
    "Green, because close is above its own open",
    "Red, because $104 is below $110",
    "Color always predicts tomorrow’s price",
  ],
  [
    "Doji: a small body",
    "A doji has an open and close that are equal or very close together. Its body is tiny, while its wicks may be long or short. It describes a period with little net movement, sometimes called indecision.",
    "Open $100, high $106, low $94, close $100.02: the price traveled in both directions but ended almost where it began.",
    "A doji does not guarantee a reversal. Its meaning depends on the surrounding trend, timeframe, and other evidence.",
    "What makes a candle a doji?",
    "Its open and close are nearly equal",
    "Its high and low must be equal",
    "It guarantees the next price will rise",
  ],
  [
    "Hammer: a long lower wick",
    "A hammer-shaped candle has a small body near the top of its range, a long lower wick, and little upper wick. After a decline, it shows that prices moved much lower and then recovered during that period.",
    "Open $100, high $102, low $90, close $101: the $10 lower wick is much longer than the $1 body. The same shape after a rise can have a different interpretation.",
    "A hammer is an observation, not a buy instruction. Look at context and later periods; even a recovery candle can be followed by another drop.",
    "Does a hammer after a decline guarantee a rebound?",
    "No; the pattern can fail",
    "Yes; every hammer guarantees a profit",
    "Yes, if the candle is green",
  ],
  [
    "Engulfing candles and a practice plan",
    "A bullish engulfing example has a falling candle followed by a rising candle whose body covers the previous body. A bearish example reverses those directions. Compare bodies, not just wicks.",
    "First candle: open $105, close $100. Next: open $98, close $107. The second body covers the first. Its wicks do not need to cover the first candle’s full range.",
    "Patterns can fail and are not trading signals by themselves. Practice describing the pattern, checking its timeframe and trend, and considering position size and possible loss before placing a virtual trade.",
    "What does an engulfing pattern compare?",
    "The bodies of two consecutive candles",
    "Only the tallest upper wick",
    "Guaranteed future profits",
  ],
];
const originalLessons: Lesson[] = content.map((c, i) => ({
  id: i + 1,
  level: Math.floor(i / 5) + 1,
  title: c[0],
  explanation: c[1],
  example: c[2],
  why: c[3],
  quiz: {
    question: c[4],
    options: [c[6], c[5], c[7]],
    answer: 1,
    explanation: c[2] + " " + c[3],
  },
}));
export const lessons: Lesson[] = [...originalLessons, ...dayTradingLessons, ...indicatorLessons, ...expandedLessons];
export function answerLesson(s: State, id: number, answer: number): State {
  const lesson = lessons.find((l) => l.id === id);
  if (!lesson) throw new Error("Lesson not found.");
  const correct = answer === lesson.quiz.answer,
    fresh = !s.learning.completed.includes(id);
  const day = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const completed =
    correct && fresh ? [...s.learning.completed, id] : s.learning.completed;
  const levelBonus =
    correct &&
    fresh &&
    lessons
      .filter((l) => l.level === lesson.level)
      .every((l) => completed.includes(l.id))
      ? 100
      : 0;
  return {
    ...s,
    learning: {
      ...s.learning,
      completed,
      attempts: [
        ...s.learning.attempts,
        { lessonId: id, correct, date: new Date().toISOString() },
      ],
      xp: s.learning.xp + (correct && fresh ? 35 : 0) + levelBonus,
      streak:
        s.learning.lastDay === day
          ? s.learning.streak
          : s.learning.lastDay === yesterday
            ? s.learning.streak + 1
            : 1,
      lastDay: day,
    },
  };
}
export const achievements: Achievement[] = [
  {
    id: "lesson",
    title: "First Lesson",
    description: "Complete your first lesson",
  },
  { id: "trade", title: "First Trade Completed", description: "Make a practice trade" },
  {
    id: "five",
    title: "5 Lessons Completed",
    description: "Complete five lessons",
  },
  {
    id: "basics",
    title: "Trading Basics Complete",
    description: "Finish all Level 1 lessons",
  },
  {
    id: "builder",
    title: "Portfolio Builder",
    description: "Hold three different stocks",
  },
  {id:"streak",title:"5 Days in a Row",description:"Complete a knowledge check on five consecutive days"},
  {id:"risk",title:"Risk Mastery",description:"Complete all five execution, accounts, and risk lessons"},
  {id:"chart",title:"Chart Pro",description:"Complete the chart-reading and candlestick lessons"},
  {
    id: "quiz",
    title: "Quiz Master",
    description: "Answer 10 knowledge checks correctly",
  },
  ...expandedModules.map((m,i)=>({id:`module-${i+13}`,title:m.reward,description:`Complete all lessons in ${m.title}`})),
  {id:"fifty",title:"50 Lessons Completed",description:"Build understanding across fifty lessons"},
  {id:"hundred",title:"100 Lessons Completed",description:"Complete one hundred knowledge checks"},
  {id:"curriculum",title:"Well-Rounded Learner",description:"Complete the current trading and personal finance curriculum"},
];
export function earned(s: State, id: string): boolean {
  if(id.startsWith("module-")){const level=Number(id.slice(7));const group=lessons.filter(l=>l.level===level);return group.length>0&&group.every(l=>s.learning.completed.includes(l.id));}
  if(id==="fifty")return s.learning.completed.length>=50;
  if(id==="hundred")return s.learning.completed.length>=100;
  if(id==="curriculum")return lessons.every(l=>s.learning.completed.includes(l.id));
  return (
    (
      {
        streak: s.learning.streak >= 5,
        risk: lessons.filter(l=>l.level===8).every(l=>s.learning.completed.includes(l.id)),
        chart: lessons.filter(l=>l.level===4||l.level===6).every(l=>s.learning.completed.includes(l.id)),
        lesson: s.learning.completed.length > 0,
        trade: s.trades.length > 0,
        five: s.learning.completed.length >= 5,
        basics: [1, 2, 3, 4, 5].every((i) => s.learning.completed.includes(i)),
        builder: s.holdings.length >= 3,
        quiz: s.learning.attempts.filter((a) => a.correct).length >= 10,
      } as Record<string, boolean>
    )[id] || false
  );
}
