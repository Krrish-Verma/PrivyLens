"use client";

import { useId } from "react";
import {
  ComposedChart,
  Area,
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

const CHART_GRID = "#1e2a3d";
const CHART_AXIS = "#5c6d84";
const CHART_TICK = "#94a3b8";

export default function EventsPerMinuteChart({ data, showNoisy }: EventsPerMinuteChartProps) {
  const key = showNoisy ? "noisyCount" : "count";
  const name = showNoisy ? "Noisy" : "True";
  const areaGradId = `area-${useId().replace(/:/g, "")}`;
  const lineGradId = `line-${useId().replace(/:/g, "")}`;

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.time * 1000).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
  }));

  const empty = formatted.length === 0;

  return (
    <div className="rounded-2xl border border-border-subtle bg-card/60 p-5 shadow-card backdrop-blur-sm md:p-6">
      <div className="mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Events per minute
        </h3>
        <p className="mt-0.5 text-xs text-muted">60-second buckets, live from the API</p>
      </div>
      {empty ? (
        <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-elevated/50 text-center">
          <p className="text-sm font-medium text-foreground-soft">No time series yet</p>
          <p className="mt-1 max-w-xs px-4 text-xs text-muted">
            Once events are recorded, this chart will show rate over time.
          </p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={formatted} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
              <defs>
                <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id={lineGradId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={CHART_AXIS}
                tick={{ fill: CHART_TICK, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID }}
                minTickGap={24}
              />
              <YAxis
                stroke={CHART_AXIS}
                tick={{ fill: CHART_TICK, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload.find((p) => p.dataKey === key);
                  if (!row) return null;
                  return (
                    <div
                      className="rounded-xl border border-[#243044] px-3 py-2 text-sm shadow-lg"
                      style={{
                        backgroundColor: "#111923",
                        boxShadow: "0 12px 40px -12px rgba(0,0,0,0.55)",
                      }}
                    >
                      <p className="mb-1 font-semibold text-[#c4d0e0]">{label}</p>
                      <p className="text-[#e8eef6]">
                        <span className="text-foreground-soft">{name}: </span>
                        <span className="tabular-nums font-medium">{row.value as number}</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => <span className="text-sm text-foreground-soft">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey={key}
                name={name}
                stroke="transparent"
                fill={`url(#${areaGradId})`}
                fillOpacity={1}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey={key}
                name={name}
                stroke={`url(#${lineGradId})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#7dd3fc", stroke: "#0c4a6e", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
