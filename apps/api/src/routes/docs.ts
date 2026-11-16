import { Router } from "express";
import { Analyzer } from "@repolens/analyzer";
import { DocGenerator } from "@repolens/generator";

export const docsRouter = Router();

/**
 * POST /api/docs/generate
 * Body: { path: string }
 * Scans + generates docs, returns the GeneratedDocs object.
 */
docsRouter.post("/generate", async (req, res) => {
  const { path: targetPath } = req.body as { path?: string };

  if (!targetPath) {
    res.status(400).json({ error: "Missing required field: path" });
    return;
  }

  try {
    const analyzer = new Analyzer();
    const scan = await analyzer.analyze(targetPath);

    const generator = new DocGenerator();
    const docs = generator.generate(scan);

    res.json({ scan, docs });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Generation failed" });
  }
});
