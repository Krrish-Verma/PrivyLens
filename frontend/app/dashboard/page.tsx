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
  const [budget, setBudget] = useState({ used: 0, limit: 5 });
  const [epsilon, setEpsilon] = useState(0.5);
  const [showNoisy, setShowNoisy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    const eps = epsilon;
    const noise = showNoisy ? "true" : "false";
    try {
      const [pvRes, epmRes, budgetRes] = await Promise.all([
        fetch(`${API}/api/analytics/pageviews?epsilon=${eps}&useNoise=${noise}`),
        fetch(`${API}/api/analytics/events-per-minute?epsilon=${eps}&useNoise=${noise}`),
        fetch(`${API}/api/analytics/budget`),
      ]);

      if (pvRes.ok) {
        const j = await pvRes.json();
        setPageviews(j.pageviews ?? []);
        if (j.privacyBudget) setBudget(j.privacyBudget);
      } else if (pvRes.status === 429) {
        const j = await pvRes.json();
        setError(j.error ?? "Privacy budget exceeded");
        setBudget({ used: j.used ?? 5, limit: j.limit ?? 5 });
      }

      if (epmRes.ok) {
        const j = await epmRes.json();
        setEventsPerMinute(j.series ?? []);
        if (j.privacyBudget) setBudget(j.privacyBudget);
      }
      if (budgetRes.ok) {
        const j = await budgetRes.json();
        setBudget({ used: j.used, limit: j.limit });
      }
      if (pvRes.ok) setError(null);
    } catch (e) {
      setError("Failed to reach API. Is the backend running on port 4000?");
    }
  }, [epsilon, showNoisy]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const totalTrue = pageviews.reduce((s, r) => s + r.count, 0);
  const totalNoisy = pageviews.reduce((s, r) => s + r.noisyCount, 0);

  return (
    <main className="min-h-screen p-6 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-muted hover:text-white transition">
            ← Home
          </Link>
          <h1 className="text-2xl font-bold text-white">PrivyLens Dashboard</h1>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-200 px-4 py-3">
          {error}
        </div>
      )}

      {/* Privacy controls */}
      <div className="rounded-xl bg-card border border-border p-5 mb-6 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="text-muted text-sm">Epsilon (ε)</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={epsilon}
            onChange={(e) => setEpsilon(Number(e.target.value))}
            className="w-32 h-2 rounded-full bg-surface accent-accent"
          />
          <span className="text-white font-mono w-8">{epsilon}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="noisy"
            checked={showNoisy}
            onChange={(e) => setShowNoisy(e.target.checked)}
            className="rounded accent-accent"
          />
          <label htmlFor="noisy" className="text-muted text-sm">
            Show noisy metrics (differential privacy)
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <PrivacyBudget used={budget.used} limit={budget.limit} />
        <MetricCard
          title="Total page views"
          value={showNoisy ? totalNoisy : totalTrue}
          subtitle={showNoisy ? "Noisy aggregate" : "True count"}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          data={pageviews}
          showNoisy={showNoisy}
          title="Page views by page"
        />
        <EventsPerMinuteChart data={eventsPerMinute} showNoisy={showNoisy} />
      </div>
    </main>
  );
}
