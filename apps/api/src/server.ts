import express from "express";
import cors from "cors";
import { scanRouter } from "./routes/scan.js";
import { docsRouter } from "./routes/docs.js";
import { checkRouter } from "./routes/check.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "0.0.1" });
});

// Routes
app.use("/api/scan", scanRouter);
app.use("/api/docs", docsRouter);
app.use("/api/check", checkRouter);

app.listen(PORT, () => {
  console.log(`RepoLens API running on http://localhost:${PORT}`);
});

export { app };
