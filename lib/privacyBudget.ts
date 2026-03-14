/**
 * Privacy budget tracking. Each query consumes epsilon; block if total > 5.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BUDGET_LIMIT = 5;

/**
 * Consume epsilon for a metric. Global budget: block if total (all metrics) > 5.
 */
export async function consumePrivacyBudget(
  metric: string,
  epsilon: number
): Promise<{ allowed: boolean; totalUsed: number }> {
  const totalUsed = await getPrivacyBudgetUsed();
  if (totalUsed + epsilon > BUDGET_LIMIT) {
    return { allowed: false, totalUsed };
  }
  await prisma.privacyBudget.create({
    data: {
      metric,
      epsilonUsed: epsilon,
      timestamp: Math.floor(Date.now() / 1000),
    },
  });
  return { allowed: true, totalUsed: totalUsed + epsilon };
}

/**
 * Get total epsilon used for a metric (or all metrics).
 */
export async function getPrivacyBudgetUsed(metric?: string): Promise<number> {
  const result = await prisma.privacyBudget.aggregate({
    where: metric ? { metric } : undefined,
    _sum: { epsilonUsed: true },
  });
  return result._sum.epsilonUsed ?? 0;
}

export { BUDGET_LIMIT };
