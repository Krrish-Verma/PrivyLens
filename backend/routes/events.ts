/**
 * Event ingestion and analytics API routes.
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { enqueueEvent } from "../../lib/stream.js";
import { applyNoise } from "../../lib/differentialPrivacy.js";
import { consumePrivacyBudget, getPrivacyBudgetUsed, BUDGET_LIMIT } from "../../lib/privacyBudget.js";
const prisma = new PrismaClient();
const router = Router();

const eventSchema = z.object({
  userId: z.string().min(1),
  event: z.string().min(1),
  page: z.string().min(1),
  timestamp: z.number().int().positive(),
});

/**
 * POST /api/events - Ingest event, persist to DB, push to stream.
 */
router.post("/events", async (req: Request, res: Response) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
  }
  const { userId, event, page, timestamp } = parsed.data;
  try {
    const created = await prisma.event.create({
      data: { userId, event, page, timestamp },
    });
    // Aggregate synchronously so analytics work even without a separate worker process.
    // The original design used an in-memory stream + worker, but that doesn't work across
    // separate Node processes (each process has its own memory).
    const BUCKET_SECONDS = 60;
    const bucketTime = Math.floor(timestamp / BUCKET_SECONDS) * BUCKET_SECONDS;
    const existing = await prisma.pageViewAggregate.findFirst({
      where: { page, bucketTime },
    });
    if (existing) {
      await prisma.pageViewAggregate.update({
        where: { id: existing.id },
        data: { count: existing.count + 1 },
      });
    } else {
      await prisma.pageViewAggregate.create({
        data: { page, count: 1, bucketTime },
      });
    }

    // Keep queue enqueue for compatibility with the existing worker script.
    enqueueEvent({ userId, event, page, timestamp });
    return res.status(201).json({ id: created.id });
  } catch (e) {
    return res.status(500).json({ error: "Failed to store event" });
  }
});

/**
 * GET /api/analytics/pageviews - Aggregates with differential privacy.
 * Query params: epsilon (default 0.5), useNoise (default true).
 */
router.get("/analytics/pageviews", async (req: Request, res: Response) => {
  const epsilon = Math.max(0.1, Math.min(1, Number(req.query.epsilon) || 0.5));
  const useNoise = req.query.useNoise !== "false";
  const metric = "pageviews";

  const budget = await consumePrivacyBudget(metric, useNoise ? epsilon : 0);
  if (!budget.allowed && useNoise) {
    return res.status(429).json({
      error: "Privacy budget exceeded",
      used: budget.totalUsed,
      limit: BUDGET_LIMIT,
    });
  }

  try {
    const aggregates = await prisma.pageViewAggregate.findMany({
      orderBy: [{ bucketTime: "desc" }],
    });

    // Group by page, sum counts
    const byPage = new Map<string, number>();
    for (const a of aggregates) {
      byPage.set(a.page, (byPage.get(a.page) ?? 0) + a.count);
    }

    const result = Array.from(byPage.entries()).map(([page, count]) => ({
      page,
      count,
      noisyCount: useNoise ? applyNoise(count, epsilon) : count,
    }));

    const totalUsed = await getPrivacyBudgetUsed(metric);
    return res.json({
      pageviews: result,
      privacyBudget: { used: totalUsed, limit: BUDGET_LIMIT },
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

/**
 * GET /api/analytics/events-per-minute - Time-series for chart.
 */
router.get("/analytics/events-per-minute", async (req: Request, res: Response) => {
  const epsilon = Math.max(0.1, Math.min(1, Number(req.query.epsilon) || 0.5));
  const useNoise = req.query.useNoise !== "false";
  const metric = "events_per_minute";

  const budget = await consumePrivacyBudget(metric, useNoise ? epsilon : 0);
  if (!budget.allowed && useNoise) {
    return res.status(429).json({
      error: "Privacy budget exceeded",
      used: budget.totalUsed,
      limit: BUDGET_LIMIT,
    });
  }

  const aggregates = await prisma.pageViewAggregate.findMany({
    orderBy: [{ bucketTime: "asc" }],
    take: 60,
  });

  const series = aggregates.map((a) => ({
    time: a.bucketTime,
    count: a.count,
    noisyCount: useNoise ? applyNoise(a.count, epsilon) : a.count,
  }));

  const totalUsed = await getPrivacyBudgetUsed(metric);
  return res.json({
    series,
    privacyBudget: { used: totalUsed, limit: BUDGET_LIMIT },
  });
});

/**
 * GET /api/analytics/budget - Current budget usage.
 */
router.get("/analytics/budget", async (_req: Request, res: Response) => {
  const used = await getPrivacyBudgetUsed();
  return res.json({ used, limit: BUDGET_LIMIT });
});

export default router;
