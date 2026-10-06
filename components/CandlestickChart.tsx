"use client";
import { useState } from "react";
import type { PriceCandle } from "@/types";
import { money } from "@/lib/market";
export default function CandlestickChart({ data }: { data: PriceCandle[] }) {
  const [selected, setSelected] = useState(39);
  if (!data.length) return <p>No candle data available.</p>;
  const index = Math.min(selected, data.length - 1),
    candle = data[index];
  const lower = Math.min(...data.map((c) => c.low)),
    upper = Math.max(...data.map((c) => c.high));
  const padding = Math.max((upper - lower) * 0.08, 0.01);
  const min = lower - padding,
    max = upper + padding;
  const y = (value: number) => 230 - ((value - min) / (max - min)) * 210;
  const step = 690 / data.length;
  const bodyWidth = Math.min(step * 0.56, 18);
  return (
    <div className="candlestick-chart">
      <div className="candle-legend">
        <span>● Green: closes higher</span>
        <span>○ Red: closes lower</span>
      </div>
      <svg
        viewBox="0 0 800 265"
        role="img"
        aria-label="Simulated candlestick price chart. Use the candle period slider below to inspect open, high, low, and close prices."
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const value = min + ((max - min) * i) / 4;
          return (
            <g key={i}>
              <line
                x1="10"
                x2="705"
                y1={y(value)}
                y2={y(value)}
                stroke="var(--line)"
                strokeDasharray="4 4"
              />
              <text x="715" y={y(value) + 4} fill="var(--muted)" fontSize="12">
                {money(value)}
              </text>
            </g>
          );
        })}
        {data.map((c, i) => {
          const x = 15 + step * (i + 0.5),
            rising = c.close >= c.open,
            color = rising ? "var(--green)" : "var(--candle-loss)";
          return (
            <g
              key={c.period}
              onMouseEnter={() => setSelected(i)}
              onClick={() => setSelected(i)}
              style={{ cursor: "pointer" }}
            >
              <title>{`Period ${c.period}: open ${money(c.open)}, high ${money(c.high)}, low ${money(c.low)}, close ${money(c.close)}`}</title>
              <rect
                x={x - step / 2}
                y="10"
                width={step}
                height="225"
                fill={i === index ? "var(--pale)" : "transparent"}
              />
              <line
                x1={x}
                x2={x}
                y1={y(c.high)}
                y2={y(c.low)}
                stroke={color}
                strokeWidth="1.5"
              />
              <rect
                x={x - bodyWidth / 2}
                y={Math.min(y(c.open), y(c.close))}
                width={bodyWidth}
                height={Math.max(1.5, Math.abs(y(c.open) - y(c.close)))}
                fill={rising ? color : "var(--surface)"}
                stroke={color}
                strokeWidth="1.5"
              />
              {(i === 0 || i === data.length - 1 || i % 10 === 0) && (
                <text
                  x={x}
                  y="257"
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--muted)"
                >
                  {c.period}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="candle-values" aria-live="polite">
        <strong>Period {candle.period}</strong>
        <span>Open {money(candle.open)}</span>
        <span>High {money(candle.high)}</span>
        <span>Low {money(candle.low)}</span>
        <span>Close {money(candle.close)}</span>
      </div>
      <label className="candle-slider">
        Inspect candle period
        <input
          aria-label="Candle period"
          type="range"
          min="0"
          max={data.length - 1}
          step="1"
          value={index}
          onChange={(e) => setSelected(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
