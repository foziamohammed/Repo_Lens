import { Router } from "express";
import { Analyzer } from "@repolens/analyzer";

export const scanRouter = Router();

/**
 * POST /api/scan
 * Body: { path: string }
 * Scans the given local path and returns the scan result.
 */
scanRouter.post("/", async (req, res) => {
  const { path: targetPath } = req.body as { path?: string };

  if (!targetPath) {
    res.status(400).json({ error: "Missing required field: path" });
    return;
  }

  try {
    const analyzer = new Analyzer();
    const result = await analyzer.analyze(targetPath);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Scan failed" });
  }
});
