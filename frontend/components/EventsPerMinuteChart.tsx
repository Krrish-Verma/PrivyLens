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

const CHART_GRID = "rgba(157, 167, 179, 0.14)";
const CHART_AXIS = "#6B7280";
const CHART_TICK = "#9DA7B3";

export default function EventsPerMinuteChart({ data, showNoisy }: EventsPerMinuteChartProps) {
  const areaGradId = `area-${useId().replace(/:/g, "")}`;
  const lineGradId = `line-${useId().replace(/:/g, "")}`;

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.time * 1000).toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
  }));

  const empty = formatted.length === 0;

  return (
    <div className="rounded-2xl bg-surface-elevated/70 p-5 shadow-soft transition duration-200 hover:scale-[1.01]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Visit trend over time</h3>
        <p className="mt-0.5 text-sm text-foreground-soft">
          Exact count vs private count in 60-second buckets
        </p>
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
              <CartesianGrid strokeDasharray="2 10" stroke={CHART_GRID} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={CHART_AXIS}
                tick={{ fill: CHART_TICK, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                stroke={CHART_AXIS}
                tick={{ fill: CHART_TICK, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
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
                      <p className="mb-1 font-medium text-foreground-soft">Time: {label}</p>
                      <p className="text-foreground">Page: all surfaces</p>
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
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => <span className="text-sm text-foreground-soft">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="True"
                stroke="transparent"
                fill={`url(#${areaGradId})`}
                fillOpacity={1}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Exact count"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="noisyCount"
                name="Private count"
                stroke={`url(#${lineGradId})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#7dd3fc", stroke: "#0c4a6e", strokeWidth: 2 }}
                opacity={showNoisy ? 1 : 0.25}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-3 text-xs text-foreground-soft">
        Trend shape remains useful even after privacy protection is applied.
      </p>
    </div>
  );
}
