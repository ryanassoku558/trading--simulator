"use client";
import {
  ComposedChart,
  Line,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useId } from "react";
import { money } from "@/lib/market";
export default function Chart({
  data,
  color = "#14856f",
  line=false,
  label="Value over time",
}: {
  data: { date: string; price: number }[];
  color?: string;
  line?:boolean;
  label?:string;
}) {
  const gradientId = useId();
  return (
    <div className="chart" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--line)"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            minTickGap={45}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
          />
          <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
          <Tooltip
            formatter={(v) => money(Number(v))}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }}
          />
          {line?<Line type="linear" dataKey="price" name="Price" stroke={color} strokeWidth={2.5} dot={false} isAnimationActive={false}/>:<Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
