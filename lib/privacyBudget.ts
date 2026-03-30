/**
 * In-memory privacy budget for deterministic demo behavior.
 * - Max budget: 5.0
 * - Resets every 30 seconds
 */

const BUDGET_LIMIT = 5.0;
const RESET_WINDOW_SECONDS = 30;

interface BudgetState {
  used: number;
  windowStartSec: number;
}

const state: BudgetState = {
  used: 0,
  windowStartSec: Math.floor(Date.now() / 1000),
};

function refreshWindow(nowSec: number): void {
  if (nowSec - state.windowStartSec >= RESET_WINDOW_SECONDS) {
    state.used = 0;
    state.windowStartSec = nowSec;
  }
}

export interface BudgetSnapshot {
  used: number;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

export async function getBudgetSnapshot(): Promise<BudgetSnapshot> {
  const nowSec = Math.floor(Date.now() / 1000);
  refreshWindow(nowSec);
  return {
    used: Number(state.used.toFixed(2)),
    limit: BUDGET_LIMIT,
    remaining: Number(Math.max(0, BUDGET_LIMIT - state.used).toFixed(2)),
    resetInSeconds: Math.max(0, RESET_WINDOW_SECONDS - (nowSec - state.windowStartSec)),
  };
}

/**
 * Consume epsilon from the current window.
 */
export async function consumePrivacyBudget(
  epsilon: number
): Promise<{ allowed: boolean; snapshot: BudgetSnapshot }> {
  const nowSec = Math.floor(Date.now() / 1000);
  refreshWindow(nowSec);

  if (state.used + epsilon > BUDGET_LIMIT) {
    return { allowed: false, snapshot: await getBudgetSnapshot() };
  }

  state.used = Number((state.used + epsilon).toFixed(2));
  return { allowed: true, snapshot: await getBudgetSnapshot() };
}

export { BUDGET_LIMIT, RESET_WINDOW_SECONDS };
