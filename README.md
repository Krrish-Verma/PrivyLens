# PrivyLens

Privacy-preserving analytics dashboard that demonstrates **differential privacy** in an analytics pipeline. Built for a technical demo: event ingestion, streaming, DP noise, privacy budgets, and an encrypted-storage-ready design—all runnable locally.

## Overview

PrivyLens lets organizations analyze user activity without exposing individual user data. It includes:

- **Event ingestion** via REST API
- **Streaming analytics** (in-memory queue → worker)
- **Differential privacy** (Laplace mechanism)
- **Privacy budgets** (ε per query, hard cap)
- **Encryption utility** (AES-256, KMS-style)
- **Analytics dashboard** (Next.js + Recharts)

## Architecture

The system mirrors a cloud-style pipeline but runs entirely on your machine:

```
┌─────────────────┐
│ Event Generator │  (scripts/simulateUsers.ts)
└────────┬────────┘
         │ POST /api/events
         ▼
┌─────────────────┐
│ API Gateway      │  Express API (backend/server.ts)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Event Stream     │  In-memory queue (lib/stream.ts) — simulates Kinesis
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Worker Processor │  backend/worker/processor.ts — simulates Fargate
└────────┬────────┘
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
| Fargate       | Node worker       |
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

### 2. Database

```bash
npx prisma migrate dev
```

This creates the SQLite DB and runs migrations.

### 3. Start the stack

**Terminal 1 – API + frontend:**

```bash
npm run dev
```

This starts the Express API (port 4000) and the Next.js app (port 3000).

**Terminal 2 – Worker:**

```bash
npm run worker
```

**Terminal 3 – Event simulator (optional):**

```bash
npm run simulate
```

This sends continuous `page_view` events from 100 simulated users to `POST /api/events`.

### 4. Open the dashboard

In your browser:

**http://localhost:3000/dashboard**

You should see:

- Page views by page (bar chart)
- Events per minute (time-series)
- Privacy budget meter (ε used / 5.0)
- Epsilon slider and “Show noisy metrics” toggle

## Scripts

| Script       | Description                          |
|-------------|--------------------------------------|
| `npm run dev`     | Start API + Next.js (concurrently)   |
| `npm run worker`  | Run the stream processor worker      |
| `npm run simulate` | Run the event generator script    |

## Demo workflow (recorder-friendly)

1. `npm install`
2. `cd frontend && npm install && cd ..`
3. `npx prisma migrate dev`
4. `npm run dev` (leave running)
5. In a second terminal: `npm run worker`
6. In a third terminal: `npm run simulate`
7. Open **http://localhost:3000/dashboard**
8. Show live analytics, toggle “Show noisy metrics,” move the epsilon slider, and point out the privacy budget cap.

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
