import { Router, Request, Response } from "express";
import { MapsService } from "../services/mapsService";
import { PickupHub } from "../models/PickupHub";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { logAuditEvent } from "../services/auditService";

const router = Router();

// GET /api/places/config (Client-safe map configuration)
router.get("/config", (_req: Request, res: Response) => {
  res.status(200).json({
    mapsMode: MapsService.getMapMode(),
    isLive: MapsService.isLiveMode(),
    // Client-safe indicator only, never server API key
  });
});

// GET /api/places/search?q=...
router.get("/search", async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string) || "";
    const result = await MapsService.searchPlaces(q);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to search places" });
  }
});

// POST /api/routes/calculate
router.post("/routes/calculate", async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, intermediates } = req.body;
    if (!origin || !destination || typeof origin.lat !== "number" || typeof destination.lat !== "number") {
      res.status(400).json({ code: "BAD_REQUEST", message: "Valid origin and destination coordinates required" });
      return;
    }

    const route = await MapsService.computeRoadRoute(origin, destination, intermediates || []);
    res.status(200).json(route);
  } catch (err: any) {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to calculate road route" });
  }
});

// GET /api/places/hubs (Campus Pickup Hubs)
router.get("/hubs", async (req: Request, res: Response): Promise<void> => {
  try {
    const campusId = req.query.campusId as string;
    const filter: any = { active: true };
    if (campusId) {
      filter.campusId = campusId;
    }
    const hubs = await PickupHub.find(filter).sort({ name: 1 });
    res.status(200).json({ hubs });
  } catch (err: any) {
    res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch pickup hubs" });
  }
});

// POST /api/places/hubs (Admin creates Pickup Hub)
router.post(
  "/hubs",
  requireAuth,
  requireRole("campus_admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { institutionId, campusId, name, address, coordinates, radiusMeters, description } = req.body;
      if (!institutionId || !campusId || !name || !coordinates || coordinates.length !== 2) {
        res.status(400).json({ code: "BAD_REQUEST", message: "Required hub parameters missing" });
        return;
      }

      const hub = await PickupHub.create({
        institutionId,
        campusId,
        name,
        address: address || name,
        location: {
          type: "Point",
          coordinates, // [lng, lat]
        },
        radiusMeters: radiusMeters || 50,
        description,
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        action: "ADMIN_CREATED_PICKUP_HUB",
        resourceType: "PickupHub",
        resourceId: hub._id.toString(),
        req,
      });

      res.status(201).json({ message: "Pickup hub created successfully", hub });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to create pickup hub" });
    }
  }
);

export default router;

