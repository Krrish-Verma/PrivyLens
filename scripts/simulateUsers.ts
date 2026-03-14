/**
 * Simulates 100 users generating page_view events to POST /api/events.
 * Pages: home, pricing, docs, blog, login. One event every ~200ms.
 */

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const PAGES = ["home", "pricing", "docs", "blog", "login"];
const NUM_USERS = 100;
const INTERVAL_MS = 200;

function randomPage(): string {
  return PAGES[Math.floor(Math.random() * PAGES.length)];
}

function randomUserId(): string {
  return `u${Math.floor(Math.random() * NUM_USERS) + 1}`;
}

async function sendEvent(): Promise<void> {
  const payload = {
    userId: randomUserId(),
    event: "page_view",
    page: randomPage(),
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
