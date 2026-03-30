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

const CHART_GRID = "rgba(157, 167, 179, 0.14)";
const CHART_AXIS = "#6B7280";
const CHART_TICK = "#9DA7B3";

export default function AnalyticsChart({ data, showNoisy, title }: AnalyticsChartProps) {
  const trueGradId = `true-bar-${useId().replace(/:/g, "")}`;
  const noisyGradId = `noisy-bar-${useId().replace(/:/g, "")}`;

  const empty = data.length === 0;

  return (
    <div className="rounded-2xl bg-surface-elevated/70 p-5 shadow-soft transition duration-200 hover:scale-[1.01]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
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
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barCategoryGap={12}>
              <defs>
                <linearGradient id={trueGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9} />
                </linearGradient>
                <linearGradient id={noisyGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 10" stroke={CHART_GRID} vertical={false} />
              <XAxis
                dataKey="page"
                stroke={CHART_AXIS}
                tick={{ fill: CHART_TICK, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={CHART_AXIS}
                tick={{ fill: CHART_TICK, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(56, 189, 248, 0.06)" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const trueRow = payload.find((p) => p.dataKey === "count");
                  const noisyRow = payload.find((p) => p.dataKey === "noisyCount");
                  const trueCount = Number(trueRow?.value ?? 0);
                  const noisyCount = Number(noisyRow?.value ?? 0);
                  const delta = noisyCount - trueCount;
                  return (
                    <div
                      className="rounded-xl border border-border/70 px-3 py-2 text-sm shadow-soft"
                      style={{
                        backgroundColor: "#11161c",
                      }}
                    >
                      <p className="mb-1 font-medium text-foreground-soft">Page: {label}</p>
                      <p className="text-foreground">Exact count: {trueCount}</p>
                      <p className="text-foreground">Private count: {noisyCount}</p>
                      <p className="text-foreground-soft">
                        Noise added: {delta >= 0 ? `+${delta}` : delta}
                      </p>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(value) => <span className="text-sm text-foreground-soft">{value}</span>}
              />
              <Bar
                dataKey="count"
                name="Exact count"
                fill={`url(#${trueGradId})`}
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
              />
              <Bar
                dataKey="noisyCount"
                name="Private count"
                fill={`url(#${noisyGradId})`}
                radius={[6, 6, 0, 0]}
                maxBarSize={42}
                opacity={showNoisy ? 1 : 0.25}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
