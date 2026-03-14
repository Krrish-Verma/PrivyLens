/**
 * API Gateway (Express) - simulates cloud API Gateway.
 * Serves event ingestion and analytics endpoints.
 */

import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api", eventsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`PrivyLens API running at http://localhost:${PORT}`);
});
