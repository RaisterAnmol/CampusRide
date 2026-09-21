import { Router, Request, Response } from "express";
import { prometheusClient } from "../middleware/telemetry";

const router = Router();

/**
 * GET /metrics
 * Scraped by Prometheus or Grafana Agent
 */
router.get("/metrics", async (_req: Request, res: Response): Promise<void> => {
  try {
    res.set("Content-Type", prometheusClient.register.contentType);
    const metrics = await prometheusClient.register.metrics();
    res.end(metrics);
  } catch (err: any) {
    res.status(500).end(err.message);
  }
});

export default router;
