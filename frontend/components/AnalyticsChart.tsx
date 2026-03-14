"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  page: string;
  count: number;
  noisyCount: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  showNoisy: boolean;
  title: string;
}

export default function AnalyticsChart({ data, showNoisy, title }: AnalyticsChartProps) {
  const key = showNoisy ? "noisyCount" : "count";
  const name = showNoisy ? "Noisy count" : "True count";

  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <h3 className="text-muted text-sm font-medium uppercase tracking-wide mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
            <XAxis dataKey="page" stroke="#64748b" tick={{ fill: "#94a3b8" }} />
            <YAxis stroke="#64748b" tick={{ fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a2332", border: "1px solid #2d3a4f" }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Legend />
            <Bar dataKey={key} name={name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
