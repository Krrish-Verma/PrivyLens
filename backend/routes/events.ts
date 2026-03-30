/**
 * Event ingestion and analytics API routes.
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { applyNoise } from "../../lib/differentialPrivacy.js";
import { consumePrivacyBudget, getBudgetSnapshot } from "../../lib/privacyBudget.js";

const router = Router();

const eventSchema = z.object({
  userId: z.string().min(1),
  event: z.string().min(1),
  page: z.string().min(1),
  timestamp: z.number().int().positive(),
});

const GROUND_TRUTH: Record<string, number> = {
  "marketing site": 1200,
  "pricing page": 800,
  "developer docs": 300,
  dashboard: 1000,
  login: 200,
};

const BUCKET_WEIGHTS = [0.04, 0.06, 0.08, 0.07, 0.09, 0.08, 0.1, 0.12, 0.11, 0.1, 0.08, 0.07];

type PageViewRow = { page: string; count: number; noisyCount: number };
type TimeSeriesRow = { time: number; count: number; noisyCount: number };

const cycleNoiseCache = new Map<string, Map<string, number>>();

function getGroundTruth(simulateSingleUser: boolean): Record<string, number> {
  const phase = Math.floor(Date.now() / 1000 / 30);
  const drifted = Object.fromEntries(
    Object.entries(GROUND_TRUTH).map(([page, count], idx) => {
      // Add gentle deterministic drift so aggregates feel system-like but stable.
      const wave = Math.round(Math.sin((phase + idx) * 0.7) * (count * 0.015));
      return [page, Math.max(0, count + wave)];
    })
  ) as Record<string, number>;
  if (!simulateSingleUser) return drifted;
  return { ...drifted, "pricing page": drifted["pricing page"] + 1 };
}

function buildSeries(total: number): { time: number; count: number }[] {
  const nowBucket = Math.floor(Date.now() / 1000 / 60) * 60;
  const raw = BUCKET_WEIGHTS.map((w) => w * total);
  const floorVals = raw.map((x) => Math.floor(x));
  let remaining = total - floorVals.reduce((a, b) => a + b, 0);
  const withFrac = raw.map((x, idx) => ({ idx, frac: x - Math.floor(x) })).sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < withFrac.length && remaining > 0; i++, remaining--) {
    floorVals[withFrac[i].idx] += 1;
  }

  return floorVals.map((count, idx) => ({
    time: nowBucket - (BUCKET_WEIGHTS.length - 1 - idx) * 60,
    count,
  }));
}

function getCycleNoise(cycleId: string, key: string): number | undefined {
  return cycleNoiseCache.get(cycleId)?.get(key);
}

function setCycleNoise(cycleId: string, key: string, value: number): void {
  if (!cycleNoiseCache.has(cycleId)) cycleNoiseCache.set(cycleId, new Map());
  const cycle = cycleNoiseCache.get(cycleId)!;
  cycle.set(key, value);
}

/**
 * POST /api/events
 * Accepted for compatibility with older clients; analytics in this demo are deterministic
 * and always derived from the fixed ground-truth dataset below.
 */
router.post("/events", async (req: Request, res: Response) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }
  return res.status(202).json({
    accepted: true,
    message: "Deterministic demo mode: analytics derive from fixed dataset.",
  });
});

/**
 * GET /api/analytics/pageviews - Aggregates with differential privacy.
 */
router.get("/analytics/pageviews", async (req: Request, res: Response) => {
  const epsilon = Math.max(0.1, Math.min(1, Number(req.query.epsilon) || 0.5));
  const useNoise = req.query.useNoise !== "false";
  const cycleId = String(req.query.cycleId ?? `${Math.floor(Date.now() / 1000 / 5)}`);
  const simulateSingleUser = req.query.simulateSingleUser === "true";

  const budget = await consumePrivacyBudget(epsilon);
  if (!budget.allowed) {
    return res.status(429).json({
      error: "Privacy budget exceeded. Try again shortly.",
      privacyBudget: budget.snapshot,
    });
  }

  const truth = getGroundTruth(simulateSingleUser);
  const result: PageViewRow[] = Object.entries(truth)
    .map(([page, count]) => {
      if (!useNoise) return { page, count, noisyCount: count };
      const noiseKey = `pageviews|${cycleId}|${epsilon}|${simulateSingleUser}|${page}`;
      const cached = getCycleNoise(cycleId, noiseKey);
      const noisyCount = cached ?? applyNoise(count, epsilon, noiseKey);
      if (cached == null) setCycleNoise(cycleId, noiseKey, noisyCount);
      return { page, count, noisyCount };
    })
    .sort((a, b) => b.count - a.count);

  return res.json({
    pageviews: result,
    privacyBudget: budget.snapshot,
    cycleId,
  });
});

/**
 * GET /api/analytics/events-per-minute - Time-series for chart.
 */
router.get("/analytics/events-per-minute", async (req: Request, res: Response) => {
  const epsilon = Math.max(0.1, Math.min(1, Number(req.query.epsilon) || 0.5));
  const useNoise = req.query.useNoise !== "false";
  const cycleId = String(req.query.cycleId ?? `${Math.floor(Date.now() / 1000 / 5)}`);
  const simulateSingleUser = req.query.simulateSingleUser === "true";

  const budget = await consumePrivacyBudget(epsilon);
  if (!budget.allowed) {
    return res.status(429).json({
      error: "Privacy budget exceeded. Try again shortly.",
      privacyBudget: budget.snapshot,
    });
  }

  const truth = getGroundTruth(simulateSingleUser);
  const total = Object.values(truth).reduce((sum, n) => sum + n, 0);
  const baseSeries = buildSeries(total);
  const series: TimeSeriesRow[] = baseSeries.map((row, idx) => {
    if (!useNoise) return { ...row, noisyCount: row.count };
    const noiseKey = `series|${cycleId}|${epsilon}|${simulateSingleUser}|${idx}`;
    const cached = getCycleNoise(cycleId, noiseKey);
    const noisyCount = cached ?? applyNoise(row.count, epsilon, noiseKey);
    if (cached == null) setCycleNoise(cycleId, noiseKey, noisyCount);
    return { ...row, noisyCount };
  });

  return res.json({
    series,
    privacyBudget: budget.snapshot,
    cycleId,
  });
});

/**
 * GET /api/analytics/budget - Current budget usage.
 */
router.get("/analytics/budget", async (_req: Request, res: Response) => {
  const snapshot = await getBudgetSnapshot();
  return res.json(snapshot);
});

export default router;
