"use client";
import type { PriceCandle } from "@/types";
import CandlestickChart from "./CandlestickChart";
const examples: Record<number, PriceCandle[]> = {
  18: [{ period: "1", open: 100, high: 108, low: 97, close: 105 }],
  26: [{ period: "1", open: 100, high: 108, low: 97, close: 105 }],
  27: [
    { period: "1", open: 108, high: 112, low: 107, close: 110 },
    { period: "2", open: 100, high: 106, low: 99, close: 104 },
  ],
  28: [{ period: "1", open: 100, high: 106, low: 94, close: 100.02 }],
  29: [
    { period: "1", open: 110, high: 111, low: 104, close: 105 },
    { period: "2", open: 105, high: 106, low: 99, close: 100 },
    { period: "3", open: 100, high: 102, low: 90, close: 101 },
  ],
  30: [
    { period: "1", open: 105, high: 110, low: 95, close: 100 },
    { period: "2", open: 98, high: 108, low: 97, close: 107 },
  ],
};
export default function CandleLessonExample({
  lessonId,
}: {
  lessonId: number;
}) {
  const data = examples[lessonId];
  if (!data) return null;
  return (
    <div className="lesson-candle-example">
      <span className="small">Illustrative practice example</span>
      <CandlestickChart key={lessonId} data={data} />
    </div>
  );
}
