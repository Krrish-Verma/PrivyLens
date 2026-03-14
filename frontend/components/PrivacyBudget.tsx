"use client";

interface PrivacyBudgetProps {
  used: number;
  limit: number;
}

export default function PrivacyBudget({ used, limit }: PrivacyBudgetProps) {
  const pct = Math.min(100, (used / limit) * 100);
  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <p className="text-muted text-sm font-medium uppercase tracking-wide">Privacy Budget</p>
      <p className="text-xl font-bold text-white mt-1">
        {used.toFixed(1)} / {limit.toFixed(1)} ε
      </p>
      <div className="mt-3 h-2 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-muted text-xs mt-2">Queries consume ε; limit prevents over-exposure.</p>
    </div>
  );
}
