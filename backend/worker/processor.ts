/**
 * Worker processor (simulates Fargate worker).
 * Polls event stream, aggregates page views into 60s buckets, writes to SQLite.
 */

import { PrismaClient } from "@prisma/client";
import { dequeueEvent, getQueueLength } from "../../lib/stream.js";

const prisma = new PrismaClient();
const BUCKET_SECONDS = 60;

function bucketTime(ts: number): number {
  return Math.floor(ts / BUCKET_SECONDS) * BUCKET_SECONDS;
}

async function processQueue(): Promise<void> {
  const event = dequeueEvent();
  if (!event) return;

  const timeBucket = bucketTime(event.timestamp);
  const page = event.page;

  const existing = await prisma.pageViewAggregate.findFirst({
    where: { page, bucketTime: timeBucket },
  });

  if (existing) {
    await prisma.pageViewAggregate.update({
      where: { id: existing.id },
      data: { count: existing.count + 1 },
    });
  } else {
    await prisma.pageViewAggregate.create({
      data: { page, count: 1, bucketTime: timeBucket },
    });
  }
}

async function run(): Promise<void> {
  console.log("PrivyLens worker started (polling every 1s)");
  for (;;) {
    try {
      let processed = 0;
      while (getQueueLength() > 0) {
        await processQueue();
        processed++;
      }
      if (processed > 0) {
        console.log(`Processed ${processed} events`);
      }
    } catch (e) {
      console.error("Worker error:", e);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
}

run();
