import { Router, Response } from "express";
import { AuditLog } from "../models/AuditLog";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/audit/logs (Admin-only audit event trail)
router.get(
  "/logs",
  requireAuth,
  requireRole("campus_admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { action, resourceType, limit = "50" } = req.query;
      const filter: any = {};
      if (action) filter.action = action;
      if (resourceType) filter.resourceType = resourceType;

      const logs = await AuditLog.find(filter)
        .populate("actorId", "name email role college")
        .sort({ timestamp: -1 })
        .limit(Math.min(100, parseInt(limit as string, 10)));

      res.status(200).json({ logs });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch audit logs" });
    }
  }
);

export default router;

