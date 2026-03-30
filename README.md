# PrivyLens

**Privacy-safe product analytics you can demo in minutes.** PrivyLens is a full-stack reference implementation of how a SaaS or platform team can ship **aggregate usage insights**—page traffic, trends, and dashboards—while making it **hard to infer whether any single person** did something specific. It pairs a polished **Next.js** frontend with an **Express** analytics API, **differential privacy** (Laplace noise), and a **privacy budget** so repeated queries cannot silently grind down protections.

This project is built to read clearly in an interview or portfolio review: the story is *privacy-safe analytics for real product teams*, not a toy chart.

---

## Why this exists

Product and growth teams need to know *what* is used and *where* users go. Classic analytics give sharp numbers, but sharp numbers can leak individual behavior when someone asks many questions or compares reports over time. Regulators and customers increasingly expect **formal privacy thinking**, not only “we aggregate data.”

PrivyLens demonstrates **controlled noise** on top of exact aggregates: you still see **directional truth** (which surfaces matter, how traffic moves), while **single-user actions** are intentionally obscured. A **query budget** caps how much “privacy spend” each release of statistics consumes, mirroring how real systems limit repeated sensitive queries.

---

## What it does

| Capability | What you see |
|------------|----------------|
| **Exact vs private counts** | Side-by-side table: exact counts, differentially private counts, and signed noise per page. |
| **Privacy level (ε)** | Slider mapped to human labels (Low Privacy / Balanced / High Privacy) with epsilon shown for technical readers. |
| **Privacy budget** | Each analytics request consumes ε; budget depletes and resets on a window; UI shows remaining time and polished limit messaging. |
| **Single-user simulation** | Toggle adds exactly **+1** to the **pricing page** true count; private output stays in the “noise band” so the individual visit is not clearly revealed—classic DP intuition. |
| **Charts** | Page traffic (bars) and visit trend over time (series), with legends and tooltips aligned to “exact” vs “private” language. |
| **SaaS-style framing** | Surfaces named like a real product: marketing site, pricing page, developer docs, dashboard, login. |

**Core mechanisms (unchanged philosophy):**

- **Laplace mechanism** — noise scale tied to ε and sensitivity; outputs are non-negative integers suitable for dashboards.
- **Deterministic demo data** — aggregates come from a fixed ground-truth base with light time-based drift so the demo feels alive without turning into a chaotic live feed.
- **Budget window** — limits cumulative ε per time window; aligns with “composition” and repeated-query risk in production narratives.

---

## Where this could be implemented

These are realistic places teams adopt this *class* of design—not a promise that this repo is production-hardened as-is, but a credible answer to “where would this go?”

- **B2B SaaS** — Internal analytics on feature usage, page paths, and docs traffic without exposing whether *customer X* clicked pricing or viewed a specific doc.
- **Healthcare / edtech / fintech** — High-sensitivity domains where **aggregate reporting** must coexist with **strict inference limits**; DP is one tool in a broader compliance story (policy, access control, auditing).
- **Mobile and web SDKs** — Telemetry pipelines that batch events server-side and release **noisy aggregates** to product dashboards instead of raw per-user counts on every slice.
- **Data platforms** — A **privacy budget** service next to your warehouse or metrics API: each approved query spends ε; analysts see when the “privacy envelope” for the period is exhausted.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | **Next.js 14** (App Router), **React**, **Tailwind CSS**, **Recharts** |
| Backend | **Node.js**, **Express**, **Zod** validation |
| Privacy core | Shared **TypeScript** modules: Laplace noise, ε clamping, in-memory budget window |
| Data (optional tooling) | **Prisma** / SQLite for other project paths; demo analytics API uses deterministic aggregates for a stable demo |

---

## Architecture (high level)

```
Browser (dashboard)
    → REST: /api/analytics/pageviews, /api/analytics/events-per-minute, /api/analytics/budget
    → Express applies consumePrivacyBudget(ε), then applyNoise(...) per metric
    → JSON to charts and comparison table
```

Event ingestion exists for compatibility; the live demo emphasizes **reproducible, explainable** aggregates suitable for interviews.

---

## Quick start

From the repository root (Windows PowerShell-friendly):

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Then open:

- **Landing:** [http://127.0.0.1:3000](http://127.0.0.1:3000)
- **Dashboard:** [http://127.0.0.1:3000/dashboard](http://127.0.0.1:3000/dashboard)

**API health:** [http://127.0.0.1:4000/health](http://127.0.0.1:4000/health)

### If ports are busy or the dev server acts stale

```bash
npm run dev:reset
```

This frees ports `3000` and `4000`, clears the Next.js cache under `frontend/.next`, and starts the stack again.

### Optional: event simulator

With the API up:

```bash
npm run dev:simulate
```

(or run `npm run simulate` after `wait-on` succeeds). Sends a round-robin stream to `POST /api/events` for pipeline realism; demo aggregates remain deterministic for consistency.

---

## Ground truth (demo dataset)

Base counts per surface (before optional time drift):

| Surface | Approx. volume |
|---------|----------------|
| marketing site | 1200 |
| pricing page | 800 |
| developer docs | 300 |
| dashboard | 1000 |
| login | 200 |

**Single-user simulation:** adds exactly **+1** to **pricing page** true count; private counts remain useful for trends while not reliably revealing that one visit.

---

## Privacy budget (demo parameters)

- **Limit:** 5.0 (ε-units per window, as implemented in `lib/privacyBudget.ts`)
- **Each** pageviews and events-per-minute request **consumes** the current ε
- **Window reset:** 30 seconds (countdown surfaced in the UI)

---

## Demo script (~2 minutes)

1. Open the dashboard and point to the **use case** line: privacy-safe product analytics for a SaaS-style product.
2. Show **exact vs private** columns and **noise added**; move the **privacy level** and note accuracy vs protection.
3. Turn on **simulate a single user on the pricing page**; highlight that **true count** steps by 1 while **private count** does not reliably out the individual.
4. Trigger enough queries to hit the **privacy limit**; show the pause message, then wait for reset and recovery.

---

## Notes for reviewers

- **Development:** Next.js dev runs without Turbopack by default for stable local behavior on Windows.
- **Prisma `EPERM` on Windows:** close Node processes using the generated client, remove stray `query_engine-windows.dll.node.tmp*` files under `node_modules/.prisma/client` if needed, then `npx prisma generate`.

---

## License

See the repository for license terms (add a `LICENSE` file if you distribute publicly).

---

*PrivyLens: aggregate insights with explicit privacy tradeoffs—ready to explain in one elevator ride.*
