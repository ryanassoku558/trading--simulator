export const chartTour=[
 ['Read the candles','Green closes above its open; red closes below. Bodies show open-to-close movement and wicks show highs and lows.','chart'],
 ['Inspect a candle','Move the crosshair over a candle. The values show open, high, low, close, body and wicks.','chart'],
 ['Choose an interval','Switch to 5m. Each candle now represents five simulated minutes; this differs from the total visible history.','interval'],
 ['Zoom the chart','Use Zoom in and Zoom out, or your mouse wheel. Zoom changes how many candles you see, not the candle interval.','navigation'],
 ['Review earlier price action','Drag the chart left or use Earlier. Latest returns to the newest candle.','navigation'],
 ['Use the crosshair','Move across the chart to read time and price scales. The dashed crosshair helps align a price with a moment.','chart'],
 ['Open a larger workspace','Use Full screen to expand the chart. Escape leaves browser full screen.','navigation'],
 ['Customize the basics','Open Settings to change candle colors, wick thickness, grid and chart type. Heikin-Ashi is transformed data, not an execution price.','settings'],
 ['Trend indicators','SMA and EMA smooth prices. VWAP uses generated volume here; Supertrend estimates trend using ATR. None guarantees direction.','indicators'],
 ['Momentum indicators','RSI, Stochastic, CCI and MACD summarize price movement. Extreme readings can persist; an indicator is not an automatic order.','indicators'],
 ['Volatility indicators','Bollinger Bands show dispersion; ATR measures recent movement. Volatility can grow after you enter, increasing possible losses.','indicators'],
 ['Volume and profile','Volume bars, averages, profile and heat colors use generated activity, not exchange trades. The profile groups activity by candle close.','indicators'],
 ['Draw a plan','Choose a drawing, then click the chart. Lines, zones, Fibonacci, notes and arrows organize ideas; they do not prove future moves.','drawings'],
 ['Plan risk and review fills','Enter a planned entry, stop, target and size. The overlay estimates risk/reward; its stop and target do not execute orders. Fill markers show recorded virtual trades.','risk'],
 ['Replay one bar at a time','Replay hides later candles. Step advances one bar. Stop replay returns to the current chart; replay does not submit historical trades.','replay'],
 ['Alerts, patterns and comparisons','Set a browser alert, review approximate pattern tags, or compare another ticker. Alerts require this page to stay open; tags are learning prompts.','advanced']
] as const;
export const starterTourSteps=8;
