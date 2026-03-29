"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import PrivacyBudget from "@/components/PrivacyBudget";
import AnalyticsChart from "@/components/AnalyticsChart";
import EventsPerMinuteChart from "@/components/EventsPerMinuteChart";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface PageViewRow {
  page: string;
  count: number;
  noisyCount: number;
}

interface EventsPerMinuteRow {
  time: number;
  count: number;
  noisyCount: number;
}

export default function DashboardPage() {
  const [pageviews, setPageviews] = useState<PageViewRow[]>([]);
  const [eventsPerMinute, setEventsPerMinute] = useState<EventsPerMinuteRow[]>([]);
  const [budget, setBudget] = useState({ used: 0, limit: 50 });
  const [epsilon, setEpsilon] = useState(0.5);
  const [showNoisy, setShowNoisy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    const eps = epsilon;
    const noise = showNoisy ? "true" : "false";
    try {
      const [pvRes, epmRes, budgetRes] = await Promise.all([
        fetch(`${API}/api/analytics/pageviews?epsilon=${eps}&useNoise=${noise}`),
        fetch(`${API}/api/analytics/events-per-minute?epsilon=${eps}&useNoise=${noise}`),
        fetch(`${API}/api/analytics/budget`),
      ]);

      let hit429 = false;

      if (pvRes.ok) {
        const j = await pvRes.json();
        setPageviews(j.pageviews ?? []);
        if (j.privacyBudget) setBudget(j.privacyBudget);
      } else if (pvRes.status === 429) {
        const j = await pvRes.json();
        setError(j.error ?? "Privacy budget exceeded");
        setBudget({ used: j.used ?? 5, limit: j.limit ?? 5 });
        hit429 = true;
      } else {
        setError("Failed to fetch page view analytics");
      }

      if (epmRes.ok) {
        const j = await epmRes.json();
        setEventsPerMinute(j.series ?? []);
        if (j.privacyBudget) setBudget(j.privacyBudget);
      } else if (epmRes.status === 429) {
        const j = await epmRes.json();
        setError(j.error ?? "Privacy budget exceeded");
        setBudget({ used: j.used ?? 5, limit: j.limit ?? 5 });
        hit429 = true;
      } else {
        setError("Failed to fetch event rate analytics");
      }
      if (budgetRes.ok) {
        const j = await budgetRes.json();
        setBudget({ used: j.used, limit: j.limit });
      }

      if (hit429) {
        setAutoRefresh(false);
      } else {
        setError(null);
      }
    } catch {
      setError("Failed to reach API. Is the backend running on port 4000?");
    }
  }, [epsilon, showNoisy]);

  useEffect(() => {
    fetchAnalytics();
    if (!autoRefresh) return;
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, [fetchAnalytics, autoRefresh]);

  useEffect(() => {
    // If the user changes privacy controls, allow polling again.
    setAutoRefresh(true);
  }, [epsilon, showNoisy]);

  const totalTrue = pageviews.reduce((s, r) => s + r.count, 0);
  const totalNoisy = pageviews.reduce((s, r) => s + r.noisyCount, 0);

  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-10 border-b border-border-subtle/80 bg-surface-elevated/75 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="shrink-0 rounded-lg border border-border-subtle bg-card/50 px-2.5 py-1.5 text-xs font-medium text-muted transition hover:border-border hover:text-foreground"
            >
              ← Home
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-foreground md:text-base">
                Dashboard
              </h1>
              <p className="hidden text-xs text-muted sm:block">PrivyLens · live aggregates</p>
            </div>
          </div>
          <span className="hidden rounded-full border border-accent/25 bg-accent-muted px-3 py-1 text-xs font-medium text-accent sm:inline">
            Auto-refresh · 5s
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {error && (
          <div
            className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/35 bg-warning/10 px-4 py-3 text-sm text-amber-100 shadow-card"
            role="alert"
          >
            <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-warning" />
            <span>{error}</span>
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-border-subtle bg-card/50 p-5 shadow-card backdrop-blur-sm md:p-6">
          <div className="mb-4 flex flex-col gap-1 border-b border-border-subtle pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Privacy controls</h2>
              <p className="text-xs text-muted">Adjust ε and whether responses include DP noise</p>
            </div>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex min-w-[200px] flex-1 flex-col gap-2 sm:max-w-md">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="epsilon" className="text-xs font-medium uppercase tracking-wider text-muted">
                  Epsilon (ε)
                </label>
                <span className="rounded-md bg-surface-elevated px-2 py-0.5 font-mono text-sm font-semibold text-accent tabular-nums">
                  {epsilon}
                </span>
              </div>
              <input
                id="epsilon"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={epsilon}
                onChange={(e) => setEpsilon(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-elevated accent-accent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-glow"
              />
              <p className="text-xs text-muted">Higher ε → less noise, stronger signal, more privacy cost per query.</p>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-subtle bg-surface-elevated/40 p-4 transition hover:border-border sm:min-w-[240px]">
              <input
                type="checkbox"
                checked={showNoisy}
                onChange={(e) => setShowNoisy(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-card text-accent focus:ring-2 focus:ring-accent/30"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">Show noisy metrics</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                  When on, charts and totals use differentially private counts from the API.
                </span>
              </span>
            </label>
          </div>
        </section>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PrivacyBudget used={budget.used} limit={budget.limit} />
          <MetricCard
            title="Total page views"
            value={showNoisy ? totalNoisy : totalTrue}
            subtitle={showNoisy ? "Noisy aggregate (DP)" : "True count (admin view)"}
          />
          <MetricCard
            title="Top page"
            value={pageviews[0]?.page ?? "—"}
            subtitle={
              pageviews[0]
                ? `${showNoisy ? pageviews[0].noisyCount : pageviews[0].count} views`
                : undefined
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnalyticsChart data={pageviews} showNoisy={showNoisy} title="Page views by page" />
          <EventsPerMinuteChart data={eventsPerMinute} showNoisy={showNoisy} />
        </div>
      </main>
    </div>
  );
}
