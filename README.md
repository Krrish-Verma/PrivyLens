# PrivyLens

**Privacy-Preserving Analytics Dashboard** — Deliver actionable user insights without ever exposing individual data. This project combines differential privacy with a cloud-native-style stack to ensure mathematically guaranteed privacy.

This repo contains a **fully runnable local MVP**: event ingestion, streaming, differential privacy (Laplace noise), privacy budgets, and an analytics dashboard—all runnable on your machine.

## Overview

PrivyLens lets organizations analyze user activity without exposing individual user data. It includes:

- **Event ingestion** via REST API
- **Streaming analytics** (in-memory queue + optional worker, simulates Kinesis → Fargate)
- **Differential privacy** (Laplace mechanism)
- **Privacy budgets** (ε per query, configurable cap via `PRIVY_BUDGET_LIMIT`)
- **Encryption utility** (AES-256, KMS-style)
- **Analytics dashboard** (Next.js + Recharts)

*(Cloud version: real-time ingestion via AWS Kinesis/API Gateway, DP engine with ε budgets in DynamoDB, Fargate/Lambda, KMS-encrypted storage, CloudWatch monitoring — **deploying soon.**)*

## Architecture

The system mirrors a cloud-style pipeline but runs entirely on your machine:

```
┌─────────────────┐
│ Event Generator │  (scripts/simulateUsers.ts) — started with `npm run dev`
└────────┬────────┘
         │ POST /api/events
         ▼
┌─────────────────┐
│ API Gateway      │  Express API (backend/server.ts)
└────────┬────────┘
         │  Persists events + updates per-minute aggregates (SQLite)
         ▼
┌─────────────────┐
│ Event Stream     │  In-memory queue (lib/stream.ts) — simulates Kinesis
└────────┬────────┘   (optional `npm run worker` also drains this queue)
         │
         ▼
┌─────────────────┐
│ SQLite (Prisma) │  Simulates DynamoDB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Differential     │  lib/differentialPrivacy.ts
│ Privacy Engine   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Next.js         │  /dashboard
│ Dashboard       │
└─────────────────┘
```

| Cloud service | Local equivalent   |
|---------------|--------------------|
| API Gateway   | Express API        |
| Kinesis       | In-memory queue    |
| Fargate       | Node worker (optional) |
| DynamoDB      | SQLite + Prisma    |
| KMS           | lib/encryption.ts  |

## Tech stack

- **Frontend:** Next.js 14, React, TailwindCSS, Recharts  
- **Backend:** Node.js, Express, TypeScript  
- **Database:** SQLite with Prisma ORM  
- **Utilities:** Node `crypto` (AES-256), custom DP (Laplace)

## How to run the demo

### 1. Install dependencies

From the project root:

```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Environment

Copy `.env.example` to `.env` at the project root (Prisma reads it). Optional: set `PRIVY_BUDGET_LIMIT` (default **50**).

For the frontend, copy `frontend/.env.example` to `frontend/.env.local` if the API is not on `http://localhost:4000`.

### 3. Database

```bash
npx prisma migrate dev
```

This creates the SQLite DB and runs migrations.

### 4. Start the stack

```bash
npm run dev
```

This runs **three processes** in parallel:

- Express API on **http://localhost:4000**
- Next.js dev server on **http://localhost:3000** (fixed port; if it fails, something else is using 3000)
- Event simulator (starts **after** the API responds on `/health`, so you do not get connection errors)

**Without** the simulator (API + UI only):

```bash
npm run dev:stack
```

**Optional** — separate worker (only needed if you want the queue drained in a second process; aggregates already update inside the API on ingest):

```bash
npm run worker
```

### 5. Open the dashboard

Open **http://localhost:3000/dashboard** (or **http://127.0.0.1:3000/dashboard** if `localhost` does not resolve the same way on your machine).

### Troubleshooting (page spins or never loads)

1. **Database** — From the repo root run `npx prisma migrate dev` so SQLite tables exist. Without this, the API can error on startup or first request.
2. **API up** — In the browser open [http://127.0.0.1:4000/health](http://127.0.0.1:4000/health). You should see `{"status":"ok"}`. If not, fix the API first; the dashboard will show “Failed to reach API”.
3. **`localhost` vs `127.0.0.1`** — If the tab loads forever, try **127.0.0.1** instead of **localhost** for both port 3000 and 4000.
4. **Port 3000 in use** — Stop the other app or change the dev command in `frontend/package.json` to another `-p` port and set `NEXT_PUBLIC_API_URL` if needed.
5. **Project on OneDrive / cloud-synced folder** — The app enables **webpack polling** in dev so file watching still works; first compile can take a minute—wait until the terminal shows “Ready”.
6. **`npm install` fails on `prisma generate` (EPERM)** — Another process has the Prisma engine file open. Quit other `node` / dev servers using this repo, then run `npx prisma generate` again. You can also run `npm install --ignore-scripts` once, then generate manually.

You should see:

- Page views by page (bar chart), sorted by volume
- Events per minute (time-series: **total events per minute bucket**)
- Privacy budget meter (ε used / limit)
- Epsilon slider and “Show noisy metrics” toggle

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | API + Next.js + event simulator (recommended for demos) |
| `npm run dev:stack` | API + Next.js only |
| `npm run dev:api` | Express API only |
| `npm run dev:frontend` | Next.js only |
| `npm run simulate` | Event generator only |
| `npm run worker` | Stream processor worker |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run build:frontend` | Production build of the Next app |
| `npm run start:frontend` | Run `next start` (after `build:frontend`) |

## Demo workflow (recorder-friendly)

1. `npm install` and `cd frontend && npm install && cd ..`
2. `npx prisma migrate dev`
3. `npm run dev` and wait for “PrivyLens API” + Next “Local:” URL
4. Open **http://localhost:3000/dashboard** (see Troubleshooting if it does not load)
5. Show live charts, toggle noisy metrics, adjust ε, and mention the privacy budget

## Project structure

```
privylens
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   └── components/
│       ├── AnalyticsChart.tsx
│       ├── EventsPerMinuteChart.tsx
│       ├── MetricCard.tsx
│       └── PrivacyBudget.tsx
├── backend/
│   ├── server.ts
│   ├── routes/
│   │   └── events.ts
│   └── worker/
│       └── processor.ts
├── lib/
│   ├── stream.ts
│   ├── differentialPrivacy.ts
│   ├── encryption.ts
│   └── privacyBudget.ts
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── simulateUsers.ts
├── package.json
└── README.md
```

## License

MIT.
