"use client";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function MetricCard({ title, value, subtitle }: MetricCardProps) {
  return (
    <div className="rounded-xl bg-card border border-border p-5">
      <p className="text-muted text-sm font-medium uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {subtitle != null && <p className="text-muted text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
