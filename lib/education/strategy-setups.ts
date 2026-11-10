type Content=[string,string,string,string,string,string,string,string];
export const strategyModules=[
 {
  "title": "Liquidity & Structure Setups",
  "track": "Trading strategies",
  "reward": "Structure Planner",
  "content": [
   [
    "Mark session highs and lows",
    "Session highs, lows, and prior-day levels describe where price previously traded. They are reference areas, not guaranteed turning points. Mark only a few clear levels before a session and identify the timeframe and session used. A price touching a level is not an entry by itself.",
    "Before a hypothetical session, mark the prior high at $105 and low at $98. If price approaches $105, compare a breakout with a rejection instead of assuming either one will happen.",
    "Clear reference areas let you write a condition before reacting to a moving candle.",
    "What does a prior session high provide?",
    "A reference area to evaluate with context",
    "A guaranteed sell signal",
    "Proof that every trader has a stop there"
   ],
   [
    "Sweep and reclaim: wait for evidence",
    "A sweep-and-reclaim setup describes price moving beyond a visible high or low and returning inside the range. Some traders interpret it as a failed breakout. The candles do not reveal every participant’s orders or prove deliberate manipulation. Define a close-back-inside rule, entry condition, and invalidation before practicing.",
    "Price briefly dips below a hypothetical $100 support to $99.70, then closes at $100.20. A practice plan might wait for a successful retest; another move below $99.70 would challenge the idea.",
    "Waiting for a reclaim distinguishes a proposed setup from buying every new low.",
    "Does trading beyond a prior low prove manipulation?",
    "No; the chart alone does not establish motives",
    "Yes; it proves a coordinated trap",
    "Yes; a reversal must follow"
   ],
   [
    "Break of structure versus a wick",
    "A structure break is a defined change in the swing pattern on a chosen timeframe. Specify which swing matters and whether a wick or a candle close qualifies. One tiny move through a level can be noise. A higher-timeframe downtrend can coexist with a short-lived upward break, so check context and the risk to the next level.",
    "A five-minute chart closes above a lower high at $102, but the hourly chart is still falling. Record that difference and the nearest resistance rather than labeling every timeframe bullish.",
    "A measurable definition makes the idea testable and reduces hindsight judgments.",
    "What should a structure-break rule specify?",
    "Timeframe, swing reference, and qualifying condition",
    "Only the candle color",
    "A guaranteed future direction"
   ],
   [
    "Retest entries and failed reclaims",
    "A retest revisits a level after a break or reclaim. Plan what holding the level means, how much tolerance you allow, and where the setup becomes invalid. A retest can fail, or price can leave without offering one. Chasing after a missed entry can increase the stop distance and reduce the possible reward relative to risk.",
    "After a hypothetical break above $102, price returns to $102.10. If your planned stop is $101.70, an entry at $104 would change the risk substantially; missing the move is a valid outcome.",
    "The same idea at a different entry price can have a very different risk profile.",
    "What if price leaves without your planned retest?",
    "Skip or reassess under written rules rather than chase",
    "Enter at any price to avoid missing out",
    "Widen the stop indefinitely"
   ]
  ]
 },
 {
  "title": "Opening Range & Breakout Setups",
  "track": "Trading strategies",
  "reward": "Breakout Planner",
  "content": [
   [
    "Define an opening range",
    "An opening range is the high and low during a specified early-session interval, such as the first fifteen minutes of the regular stock session. Choose the interval before observing the outcome. Extended hours and futures sessions use different schedules. News, spread, and volatility can make the first minutes unsuitable for a beginner.",
    "In a hypothetical first fifteen minutes, the high is $51 and low is $50. Mark both after the window ends. Do not redraw the window later simply because a different range would have won.",
    "A fixed observation window helps compare outcomes fairly across sessions.",
    "When should you choose the opening-range interval?",
    "Before evaluating the trade outcome",
    "After seeing which interval won",
    "Only after entering a position"
   ],
   [
    "Opening-range breakout confirmation",
    "An opening-range breakout attempts to trade beyond a premarked range. Define confirmation, such as a close outside the range, and compare volume and spread with normal activity. A breakout can reverse immediately. Before entry, check whether the next resistance leaves room for the planned reward after costs, and define a specific exit condition.",
    "Price closes above a hypothetical $51 range high, but resistance is $51.15 and the planned stop is $50.70. That leaves little room relative to risk, so the pattern alone may not justify a trade.",
    "Confirmation without usable reward and liquidity is not a complete plan.",
    "What else matters after a breakout close?",
    "Risk, nearby levels, liquidity, and trading costs",
    "Only a green candle",
    "The belief that every breakout continues"
   ],
   [
    "Failed breakouts and range re-entry",
    "A failed breakout moves outside a range and returns inside it. This can invalidate a continuation idea, but it does not guarantee a profitable reversal trade. Decide in advance whether re-entry closes the position, triggers a reassessment, or requires another condition. Do not reverse automatically just to recover a loss.",
    "A practice long begins above $51, then price closes back inside the range at $50.90. Follow the written invalidation rule; shorting immediately would be a separate setup with its own risk.",
    "Exit discipline keeps a failed idea from turning into an improvised recovery trade.",
    "Does a failed long breakout automatically justify a short?",
    "No; a short needs its own conditions and risk plan",
    "Yes; the opposite trade always wins",
    "Only if you double the size"
   ],
   [
    "Breakout pullback and no-trade filters",
    "A breakout pullback waits for price to revisit a broken range boundary. Define a confirmation condition and limit how long the setup remains valid. Avoid using a large position to compensate for a small target. No-trade filters can include unusually wide spreads, scheduled news, conflicting levels, and a stop distance that exceeds the risk budget.",
    "Price breaks $51, revisits $51.05, and your planned stop is $50.80. If the spread suddenly widens to $0.30, the original assumptions have changed even though the drawing looks attractive.",
    "Liquidity and costs can make an otherwise clear pattern unsuitable for execution.",
    "Which change should prompt reassessment?",
    "A spread that becomes large relative to the planned risk",
    "A popular post praising the setup",
    "The urge to enter before someone else"
   ]
  ]
 },
 {
  "title": "VWAP, Pullbacks & Momentum Setups",
  "track": "Trading strategies",
  "reward": "Trend Setup Planner",
  "content": [
   [
    "VWAP reclaim as a research setup",
    "VWAP summarizes traded price weighted by volume within a defined session. A reclaim describes price returning above it after trading below. VWAP is a reference, not an automatic buy instruction. Session definition, nearby levels, volume, and invalidation matter; repeated crosses in a sideways market can produce costly false starts.",
    "A hypothetical stock returns above its session VWAP near $80. A practice plan might wait for a hold and use a defined low as invalidation, while noting resistance at $80.40.",
    "A reference line becomes useful only when combined with a complete decision rule.",
    "Does a VWAP reclaim guarantee an uptrend?",
    "No; context and failure conditions still matter",
    "Yes; VWAP predicts every move",
    "Yes; volume removes uncertainty"
   ],
   [
    "Trend pullback toward a moving average",
    "A trend-pullback setup studies a retracement during an established swing trend. A moving average helps describe price, but its period and chart timeframe change the meaning. Define trend structure, the pullback zone, confirmation, and invalidation. Touching an average does not ensure a bounce, particularly around news or a changing regime.",
    "Higher highs and higher lows lead into a pullback toward a twenty-period average. If price instead breaks the prior swing low, the trend assumption needs review rather than a larger position.",
    "Trend context prevents treating every touch of a moving average as the same trade.",
    "What challenges an upward trend-pullback idea?",
    "Breaking the swing structure used in the plan",
    "Any red candle regardless of timeframe",
    "Using an indicator guarantees the trend holds"
   ],
   [
    "Momentum continuation and relative volume",
    "Momentum continuation studies a move that persists after a pause. Relative volume compares activity with an appropriate normal baseline, preferably matching time of day. High relative volume does not specify direction or guarantee continuation. Check spreads, volatility, nearby levels, and whether an extended price leaves a sensible stop and target.",
    "A stock rises sharply, then forms a small pause on a hypothetical chart. Volume is above normal, but entry would be far from the planned stop; a smaller size or no trade may fit better than chasing.",
    "Strong attention or volume is different from an affordable, well-defined entry.",
    "What does high relative volume establish?",
    "Unusually high activity against a baseline, not certain direction",
    "Guaranteed bullish continuation",
    "Permission to ignore the stop distance"
   ],
   [
    "Confluence without counting the same evidence twice",
    "Confluence combines distinct reasons for a setup, such as a price level, session context, and liquidity. Several indicators derived from the same price series are often correlated, not independent confirmations. Write what each input adds and what would contradict the plan. More lines on a chart do not necessarily create a stronger edge.",
    "A moving average, momentum oscillator, and green candle can all reflect the same recent rise. Add independent context such as a defined resistance area and execution costs rather than counting three votes.",
    "Independent reasoning is more useful than a pile of indicators that repeat one fact.",
    "Why can multiple indicators overstate confirmation?",
    "They may measure the same underlying price movement",
    "Every indicator is an independent forecast",
    "More indicators eliminate losses"
   ]
  ]
 },
 {
  "title": "Validate a Strategy Before Scaling",
  "track": "Trading strategies",
  "reward": "Strategy Evidence Builder",
  "content": [
   [
    "Write a reproducible strategy checklist",
    "A strategy checklist specifies instrument, session, timeframe, setup, confirmation, entry, invalidation, position size, exit, and no-trade conditions. It should allow another learner to identify both qualifying and rejected examples. A strategy nickname or winning screenshot does not provide enough detail. Keep the initial rules fixed while collecting observations.",
    "Write a hypothetical five-minute breakout rule with a range, confirmation close, stop reference, and maximum spread. Record every qualifying observation, including the ones that lose or never trigger.",
    "Precise rules make practice measurable rather than a collection of hindsight stories.",
    "What makes a setup reproducible?",
    "Explicit entry, exit, sizing, and no-trade rules",
    "A catchy name and one winning chart",
    "Changing rules after every loss"
   ],
   [
    "Expectancy: win rate is only one input",
    "Net expectancy combines the probability and size of gains and losses, then subtracts costs. With average winners and losers measured in R, the simplified expression is win rate times average winning R minus loss rate times average losing R minus average costs in R. Estimates from a small or selected sample are uncertain and can change.",
    "A hypothetical 40% win rate with 2R average wins and 1R losses gives 0.2R before costs: 0.4 times 2 minus 0.6 times 1. Costs of 0.25R make that estimate negative.",
    "A strategy can have impressive wins yet lose money after its losing trades and costs.",
    "What is the net estimate in that example?",
    "Minus 0.05R per trade under the stated assumptions",
    "Guaranteed plus 2R",
    "Plus 40R because the win rate is 40%"
   ],
   [
    "Review losing streaks and drawdowns",
    "Drawdown measures the decline from a prior equity peak. A strategy with positive historical average results can still have long losing streaks and future losses. Study drawdown, sample size, market regimes, and consecutive losses alongside average returns. Define a pause and review rule before increasing size; virtual results do not prove readiness for leveraged real trading.",
    "Five hypothetical losses at a planned $20 each reduce equity by $100 before slippage. A rule to pause after three losses would change both behavior and the observed results; document it consistently.",
    "An average return alone hides the path and the amount of loss a learner must withstand.",
    "Can positive historical expectancy coexist with losing streaks?",
    "Yes; average estimates do not prevent streaks or future losses",
    "No; a profitable backtest guarantees every week",
    "Only if the chart is incorrect"
   ],
   [
    "Check social-media claims with your own evidence",
    "Social-media examples can introduce terminology, but clips and screenshots can omit losing trades, costs, dates, changed rules, and sponsorships. Separate a plausible educational setup from verified performance. Record a full, predetermined practice sample, include costs, and use separate unseen data to evaluate rules. Avoid tuning repeatedly until the same history looks profitable.",
    "A post shows three winning entries but no complete trade log. Treat it as an idea to study, not proof of income. Compare a fixed practice sample across different conditions before drawing conclusions.",
    "Selective examples and hindsight can make an untested idea look more reliable than it is.",
    "How should a winning-trade montage affect your confidence?",
    "Use it as an idea to evaluate, not proof of profitable performance",
    "Treat it as audited evidence of future returns",
    "Copy its size because the creator won"
   ]
  ]
 },
 {
  "title": "Trading with AI Tools",
  "track": "AI & trading",
  "reward": "AI Research Reviewer",
  "content": [
   [
    "AI research copilots: verify the sources",
    "An AI tool can help organize public filings, explain terminology, and propose research questions. It can also invent facts, misread tables, or use stale information. Ask for dated primary sources and check the original document yourself. A fluent answer is not evidence of accuracy, and an AI summary is not a buy or sell decision.",
    "Ask an AI tool to summarize revenue risks from a public annual report, then open the cited filing and compare each claim with its wording, dates, units, and segment definitions. Missing citations need review.",
    "Independent source checks distinguish useful assistance from confident misinformation.",
    "What should you verify after an AI research summary?",
    "Dated primary sources and the underlying claims",
    "Only whether the answer sounds confident",
    "Nothing if the model is popular"
   ],
   [
    "AI-assisted strategy rules and backtests",
    "AI can turn a written idea into pseudocode, check a calculation, or explain a backtest report. Generated rules and code can contain errors, look-ahead bias, missing fees, or assumptions about fills that never occurred. Preserve separate unseen data and check each input. A strategy generated by AI has no automatic edge or guaranteed profitability.",
    "An AI-written test uses the day’s closing price to enter that morning. That is future information unavailable at the entry time. Correct the timing and include realistic costs before interpreting results.",
    "A polished backtest can fail because its data timing or execution assumptions are impossible.",
    "Why is entering in the morning using that day’s closing price invalid?",
    "It uses future information unavailable at the entry time",
    "AI models are allowed to know future prices",
    "The error only affects profitable trades"
   ],
   [
    "Protect account data and keep humans in control",
    "Use AI tools without sharing passwords, API secrets, bank details, or private identifying documents. Review a provider’s privacy and retention settings before uploading journals. An AI tool should not receive broker permissions merely to explain a setup. Automated trading requires separate technical controls, testing, access limits, and applicable broker rules.",
    "A prompt asking for a journal summary does not need your broker login or payment details. Remove identifiers and use a hypothetical trade example when learning to evaluate an AI response.",
    "Minimizing sensitive information reduces unnecessary exposure while preserving the educational task.",
    "What information should you withhold from a general AI trading prompt?",
    "Passwords, secret keys, and private account identifiers",
    "All public company names",
    "Every hypothetical price example"
   ],
   [
    "AI journal review without outsourcing decisions",
    "AI may help group journal entries, identify repeated behaviors, and suggest questions for reflection. Validate every count and calculation against your records; small samples do not establish causation. Use suggestions as prompts rather than commands. Sprout’s module teaches external AI use and does not activate a paid AI subscription or execute trades for you.",
    "Provide anonymized notes from several hypothetical trades and ask for recurring entry mistakes. Check whether the tool counted the trades correctly and included losing outcomes before changing a practice rule.",
    "AI assistance is most useful when it supports measurable review and accountable decisions.",
    "How should you use an AI suggestion from a short journal sample?",
    "Verify it and treat it as a hypothesis to examine",
    "Assume it proves a profitable trading edge",
    "Automatically place every trade it proposes"
   ]
  ]
 }
] as {title:string;track:string;reward:string;content:Content[]}[];
