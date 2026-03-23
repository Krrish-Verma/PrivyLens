"use client";

interface PrivacyBudgetProps {
  used: number;
  limit: number;
}

export default function PrivacyBudget({ used, limit }: PrivacyBudgetProps) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const barColor =
    pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-gradient-to-r from-accent to-accent-deep";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-card/60 p-5 shadow-card backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Privacy budget</p>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground">
        {used.toFixed(1)} <span className="text-lg font-semibold text-muted">/</span>{" "}
        {limit.toFixed(1)} <span className="text-base font-medium text-muted">ε</span>
      </p>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-elevated ring-1 ring-border-subtle">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Each query spends ε. When the budget is exhausted, the API returns 429 until it resets.
      </p>
    </div>
  );
}
