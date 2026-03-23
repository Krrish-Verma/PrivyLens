"use client";

import { useId } from "react";
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

const CHART_GRID = "#1e2a3d";
const CHART_AXIS = "#5c6d84";
const CHART_TICK = "#94a3b8";

export default function AnalyticsChart({ data, showNoisy, title }: AnalyticsChartProps) {
  const key = showNoisy ? "noisyCount" : "count";
  const name = showNoisy ? "Noisy count" : "True count";
  const gradId = `bar-${useId().replace(/:/g, "")}`;

  const empty = data.length === 0;

  return (
    <div className="rounded-2xl border border-border-subtle bg-card/60 p-5 shadow-card backdrop-blur-sm md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      </div>
      {empty ? (
        <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-elevated/50 text-center">
          <p className="text-sm font-medium text-foreground-soft">No page view data yet</p>
          <p className="mt-1 max-w-xs px-4 text-xs text-muted">
            Start the backend and emit events; bars will appear here when the API returns rows.
          </p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis
                dataKey="page"
                stroke={CHART_AXIS}
                tick={{ fill: CHART_TICK, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID }}
              />
              <YAxis
                stroke={CHART_AXIS}
                tick={{ fill: CHART_TICK, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID }}
              />
              <Tooltip
                cursor={{ fill: "rgba(56, 189, 248, 0.06)" }}
                contentStyle={{
                  backgroundColor: "#111923",
                  border: "1px solid #243044",
                  borderRadius: "12px",
                  boxShadow: "0 12px 40px -12px rgba(0,0,0,0.55)",
                }}
                labelStyle={{ color: "#c4d0e0", fontWeight: 600 }}
                itemStyle={{ color: "#e8eef6" }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => <span className="text-sm text-foreground-soft">{value}</span>}
              />
              <Bar dataKey={key} name={name} fill={`url(#${gradId})`} radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
