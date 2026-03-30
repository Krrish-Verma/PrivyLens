/**
 * Deterministic event sender (optional tool).
 * Sends a fixed, round-robin sequence to POST /api/events.
 */

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const PAGES = ["marketing site", "pricing page", "developer docs", "dashboard", "login"];
const NUM_USERS = 100;
const INTERVAL_MS = 200;
let cursor = 0;

async function sendEvent(): Promise<void> {
  const page = PAGES[cursor % PAGES.length];
  const userId = `u${(cursor % NUM_USERS) + 1}`;
  cursor += 1;

  const payload = {
    userId,
    event: "page_view",
    page,
    timestamp: Math.floor(Date.now() / 1000),
  };
  try {
    const res = await fetch(`${API_URL}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Event rejected:", res.status, await res.text());
    }
  } catch (e) {
    console.error("Request failed:", e);
  }
}

async function run(): Promise<void> {
  console.log(`PrivyLens simulator: ${NUM_USERS} users, posting every ${INTERVAL_MS}ms to ${API_URL}`);
  for (;;) {
    await sendEvent();
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
}

run();
