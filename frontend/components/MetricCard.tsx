"use client";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-card/60 p-5 shadow-card backdrop-blur-sm transition hover:border-border hover:bg-card-hover/80">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent-muted opacity-0 blur-2xl transition group-hover:opacity-100" />
      <p className="relative text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      <p className="relative mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {subtitle != null && (
        <p className="relative mt-1.5 text-sm text-foreground-soft">{subtitle}</p>
      )}
    </div>
  );
}
