"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
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

interface BudgetInfo {
  used: number;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const start = display;
    const delta = value - start;
    if (delta === 0) return;
    const startAt = performance.now();
    const duration = 260;
    let frame = 0;

    const tick = (t: number) => {
      const p = Math.min(1, (t - startAt) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + delta * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <span className="tabular-nums">{display}</span>;
}

export default function DashboardPage() {
  const [pageviews, setPageviews] = useState<PageViewRow[]>([]);
  const [eventsPerMinute, setEventsPerMinute] = useState<EventsPerMinuteRow[]>([]);
  const [budget, setBudget] = useState<BudgetInfo>({
    used: 0,
    limit: 5,
    remaining: 5,
    resetInSeconds: 30,
  });
  const [privacyLevel, setPrivacyLevel] = useState(55);
  const [showNoisy, setShowNoisy] = useState(true);
  const [simulateSingleUser, setSimulateSingleUser] = useState(false);
  const [highlightPricingRow, setHighlightPricingRow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const epsilon = useMemo(() => {
    // Higher privacy => lower epsilon => more noise.
    const mapped = 1 - 0.9 * (privacyLevel / 100);
    return Number(mapped.toFixed(2));
  }, [privacyLevel]);

  const privacyLabel = useMemo(() => {
    if (privacyLevel < 34) return "Low Privacy";
    if (privacyLevel < 67) return "Balanced";
    return "High Privacy";
  }, [privacyLevel]);

  const privacyHelper = useMemo(() => {
    if (privacyLevel < 34) return "Low Privacy: less noise, more accuracy";
    if (privacyLevel < 67) return "Balanced: moderate noise and protection";
    return "High Privacy: more noise, stronger protection";
  }, [privacyLevel]);

  useEffect(() => {
    if (!simulateSingleUser) return;
    setHighlightPricingRow(true);
    const timeout = setTimeout(() => setHighlightPricingRow(false), 1800);
    return () => clearTimeout(timeout);
  }, [simulateSingleUser]);

  const fetchAnalytics = useCallback(async () => {
    const eps = epsilon;
    const noise = showNoisy ? "true" : "false";
    const simulate = simulateSingleUser ? "true" : "false";
    const cycleId = `${Date.now()}`;
    try {
      const [pvRes, epmRes, budgetRes] = await Promise.all([
        fetch(
          `${API}/api/analytics/pageviews?epsilon=${eps}&useNoise=${noise}&simulateSingleUser=${simulate}&cycleId=${cycleId}`
        ),
        fetch(
          `${API}/api/analytics/events-per-minute?epsilon=${eps}&useNoise=${noise}&simulateSingleUser=${simulate}&cycleId=${cycleId}`
        ),
        fetch(`${API}/api/analytics/budget`),
      ]);

      if (pvRes.ok) {
        const j = await pvRes.json();
        setPageviews(j.pageviews ?? []);
        if (j.privacyBudget) setBudget(j.privacyBudget);
      } else if (pvRes.status === 429) {
        const j = await pvRes.json();
        setError(j.error ?? "Privacy budget exceeded. Try again shortly.");
        if (j.privacyBudget) setBudget(j.privacyBudget);
      } else {
        setError("Failed to fetch page view analytics");
      }

      if (epmRes.ok) {
        const j = await epmRes.json();
        setEventsPerMinute(j.series ?? []);
        if (j.privacyBudget) setBudget(j.privacyBudget);
      } else if (epmRes.status === 429) {
        const j = await epmRes.json();
        setError(j.error ?? "Privacy budget exceeded. Try again shortly.");
        if (j.privacyBudget) setBudget(j.privacyBudget);
      } else {
        setError("Failed to fetch event rate analytics");
      }
      if (budgetRes.ok) {
        const j = await budgetRes.json();
        setBudget(j);
      }
      if (pvRes.ok && epmRes.ok) {
        setError(null);
      }
    } catch {
      setError("Failed to reach API. Is the backend running on port 4000?");
    }
  }, [epsilon, showNoisy, simulateSingleUser]);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const rows = pageviews;
  const budgetBlocked = budget.remaining <= 0;

  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-20 border-b border-border/45 bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-semibold tracking-tight text-foreground">PrivyLens</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="font-medium text-foreground-soft transition hover:text-accent">
              Home
            </Link>
            <Link href="/dashboard" className="font-semibold text-foreground">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-10 md:pt-14">
        {error && (
          <div
            className="mb-8 flex items-start gap-3 rounded-xl bg-[#2a1f12] px-4 py-3 text-sm text-amber-100 shadow-soft"
            role="alert"
          >
            <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-warning" />
            <span>{error}</span>
          </div>
        )}

        <section className="mb-12">
          <span className="inline-flex items-center rounded-full border border-accent/35 bg-accent-muted px-3 py-1 text-xs font-medium tracking-wide text-accent">
            Use Case: Privacy-Safe Product Analytics
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Privacy-preserving analytics
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground-soft">
            Designed for teams that want to track feature and page usage without exposing individual
            user behavior.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground-soft">
            PrivyLens adds controlled noise to analytics data so teams can measure trends without
            identifying individual users.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-foreground-soft">
            <p>Preserve aggregate trends</p>
            <p>Hide single-user activity</p>
            <p>Limit repeated queries with privacy budget controls</p>
          </div>
        </section>

        <section
          className={`mb-8 rounded-2xl p-5 shadow-soft transition ${
            simulateSingleUser ? "bg-accent-muted ring-1 ring-accent/30" : "bg-surface-elevated/70"
          }`}
        >
          <label className="flex cursor-pointer items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Simulate a single user visiting the pricing page
              </p>
              <p className="mt-1 text-sm text-foreground-soft">
                This models an attacker trying to detect whether one specific user performed an action.
              </p>
              {simulateSingleUser ? (
                <p className="mt-2 text-xs font-medium text-accent">
                  Protected: the exact user action is hidden by differential privacy.
                </p>
              ) : null}
            </div>
            <span className="relative mt-0.5 inline-flex h-6 w-11 items-center">
              <input
                type="checkbox"
                checked={simulateSingleUser}
                onChange={(e) => setSimulateSingleUser(e.target.checked)}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full bg-[#2b333f] transition peer-checked:bg-accent/45" />
              <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white/95 transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
        </section>

        <section className="mb-10 rounded-2xl bg-surface-elevated/70 p-6 shadow-card">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Privacy controls</h2>
              <p className="mt-1 text-sm text-foreground-soft">
                Tune privacy protection for internal SaaS analytics reporting.
              </p>
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="privacy-level" className="text-sm font-medium text-foreground-soft">
                    Privacy Level
                  </label>
                  <span className="rounded-md bg-card px-2.5 py-1 text-sm font-semibold text-foreground">
                    {privacyLabel}
                  </span>
                </div>
                <input
                  id="privacy-level"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={privacyLevel}
                  onChange={(e) => setPrivacyLevel(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-card accent-accent"
                />
                <p className="mt-2 text-xs text-foreground-soft">
                  {privacyHelper}
                </p>
                <p className="mt-1 text-xs text-foreground-soft">Technical setting: epsilon = {epsilon}</p>
              </div>
            </div>

            <div>
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl bg-card/70 px-4 py-3 transition hover:bg-card-hover">
                <div>
                  <p className="text-sm font-medium text-foreground">Show noisy metrics</p>
                  <p className="text-xs text-foreground-soft">Turn private output on/off.</p>
                </div>
                <span className="relative mt-0.5 inline-flex h-6 w-11 items-center">
                  <input
                    type="checkbox"
                    checked={showNoisy}
                    onChange={(e) => setShowNoisy(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="absolute inset-0 rounded-full bg-[#2b333f] transition peer-checked:bg-accent/45" />
                  <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white/95 transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <PrivacyBudget used={budget.used} limit={budget.limit} resetInSeconds={budget.resetInSeconds} />
          <p className="mt-3 text-xs leading-relaxed text-foreground-soft">
            Each analytics query consumes a portion of the privacy budget. Limiting repeated queries
            helps prevent attackers from reverse-engineering individual behavior.
            {budgetBlocked ? (
              <span className="ml-2 rounded-md bg-[#2a1f12] px-2 py-1 text-amber-200">
                Privacy limit reached. Queries are temporarily paused to preserve user protections.
              </span>
            ) : null}
          </p>
        </section>

        <section className="mb-10 rounded-2xl bg-surface-elevated/70 p-6 shadow-soft">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-accent">
            Example scenario: a SaaS company wants to understand which surfaces users visit most, while
            protecting whether any single user visited a page.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Before vs After Privacy</h2>
          <div className="mt-5 grid grid-cols-[1.2fr_1fr_1fr_0.8fr] gap-3 border-b border-border/60 pb-2 text-sm text-foreground-soft">
            <p>Page</p>
            <p className="text-right">Exact Count</p>
            <p className="text-right">Private Count</p>
            <p className="text-right">Noise Added</p>
          </div>
          <div className="mt-2 space-y-2">
            {rows.map((row) => (
              // Brief highlight marks the single-user pricing simulation moment.
              <div
                key={`before-after-${row.page}`}
                className={`grid grid-cols-[1.2fr_1fr_1fr_0.8fr] items-center gap-3 rounded-lg px-2 py-1.5 transition ${
                  row.page === "pricing page" && highlightPricingRow
                    ? "bg-accent-muted ring-1 ring-accent/40"
                    : "bg-transparent"
                }`}
              >
                <p className="text-sm font-medium text-foreground">{row.page}</p>
                <p className="text-right text-base font-semibold text-foreground">
                  <AnimatedNumber value={row.count} />
                </p>
                <p className="text-right text-base font-semibold text-foreground">
                  <AnimatedNumber value={showNoisy ? row.noisyCount : row.count} />
                </p>
                <p className="text-right text-sm font-medium tabular-nums text-foreground-soft">
                  {(showNoisy ? row.noisyCount : row.count) - row.count > 0 ? "+" : ""}
                  {(showNoisy ? row.noisyCount : row.count) - row.count}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-foreground-soft">
            Private counts preserve useful trends while masking individual contributions.
          </p>
        </section>

        <section className="mb-8 rounded-2xl bg-surface-elevated/70 p-5 shadow-soft">
          <details className="group">
            <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
              How this works
            </summary>
            <ol className="mt-3 space-y-1 text-sm text-foreground-soft">
              <li>1. Start with exact analytics counts</li>
              <li>2. Add controlled noise using differential privacy</li>
              <li>3. Return private counts that preserve trends</li>
              <li>4. Limit repeated access through a privacy budget</li>
            </ol>
          </details>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Chart View</h2>
          <p className="text-xs text-foreground-soft">Aggregates refresh from simulated events.</p>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnalyticsChart data={pageviews} showNoisy={showNoisy} title="Page traffic" />
            <EventsPerMinuteChart data={eventsPerMinute} showNoisy={showNoisy} />
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-surface-elevated/70 p-5 shadow-soft">
          <h2 className="text-base font-semibold text-foreground">Why this matters</h2>
          <div className="mt-3 space-y-1 text-sm text-foreground-soft">
            <p>Helps teams understand usage patterns responsibly.</p>
            <p>Reduces risk of exposing individual behavior in analytics.</p>
            <p>Demonstrates privacy vs accuracy tradeoffs in production-style systems.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
