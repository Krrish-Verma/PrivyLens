"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TimePoint {
  time: number;
  count: number;
  noisyCount: number;
}

interface EventsPerMinuteChartProps {
  data: TimePoint[];
  showNoisy: boolean;
}

export default function EventsPerMinuteChart({ data, showNoisy }: EventsPerMinuteChartProps) {
  const key = showNoisy ? "noisyCount" : "count";
  const name = showNoisy ? "Noisy" : "True";

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.time * 1000).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
  }));

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <h3 className="text-muted text-sm font-medium uppercase tracking-wide mb-4">
        Events per Minute (60s buckets)
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
            <XAxis dataKey="label" stroke="#64748b" tick={{ fill: "#94a3b8" }} />
            <YAxis stroke="#64748b" tick={{ fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a2332", border: "1px solid #2d3a4f" }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={key}
              name={name}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
