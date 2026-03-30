"use client";

interface PrivacyBudgetProps {
  used: number;
  limit: number;
  resetInSeconds: number;
}

export default function PrivacyBudget({ used, limit, resetInSeconds }: PrivacyBudgetProps) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const hue = 215 - Math.round((pct / 100) * 215);
  const remaining = Math.max(0, limit - used);

  return (
    <div className="rounded-xl bg-surface-elevated/70 p-4 shadow-soft">
      <div className="flex items-end justify-between gap-4">
        <p className="text-sm text-foreground-soft">Privacy budget</p>
        <p className="text-sm text-foreground-soft">Resets in {resetInSeconds}s</p>
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
        {used.toFixed(1)} / {limit.toFixed(1)}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-card">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: `hsl(${hue} 80% 58%)`,
          }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-foreground-soft">
        <span>{remaining.toFixed(1)} remaining</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-soft">
        <span>Budget remaining: {remaining.toFixed(1)}</span>
        <span>Resets in: {resetInSeconds}s</span>
      </div>
    </div>
  );
}
