import { Router } from "express";
import { Analyzer, ChangeDetector } from "@repolens/analyzer";
import type { GeneratedDocs } from "@repolens/shared";

export const checkRouter = Router();

/**
 * POST /api/check
 * Body: { path: string; previousDocs: GeneratedDocs }
 * Returns a ChangeDetectionResult.
 */
checkRouter.post("/", async (req, res) => {
  const { path: targetPath, previousDocs } = req.body as {
    path?: string;
    previousDocs?: GeneratedDocs;
  };

  if (!targetPath || !previousDocs) {
    res.status(400).json({ error: "Missing required fields: path, previousDocs" });
    return;
  }

  try {
    const analyzer = new Analyzer();
    const currentScan = await analyzer.analyze(targetPath);

    const detector = new ChangeDetector();
    const result = detector.detect(currentScan, previousDocs);

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Check failed" });
  }
});
