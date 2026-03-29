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
- Next.js dev server on **http://localhost:3000** (or **3001** if 3000 is busy)
- Event simulator posting `page_view` events to `POST /api/events`

**Without** the simulator (API + UI only):

```bash
npm run dev:stack
```

**Optional** — separate worker (only needed if you want the queue drained in a second process; aggregates already update inside the API on ingest):

```bash
npm run worker
```

### 5. Open the dashboard

Use the URL printed by Next.js (usually **http://localhost:3000/dashboard**).

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
4. Open the dashboard URL shown in the terminal (note **3001** if 3000 is in use)
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
