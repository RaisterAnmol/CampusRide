import { Router, Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import { Trip, Ride, RideRequest, User, TripLocation } from "../models";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { getSocketIO } from "../sockets/socketHandler";
import { haversineDistanceKm } from "../services/matchingEngine";
import { logAuditEvent } from "../services/auditService";
import { z } from "zod";
import { logger } from "../utils/logger";

const router = Router();

// Helper to generate secure 6-digit CSPRNG OTP and salted hash (§3.2)
function createSecureOtp(): {
  otp: string;
  otpHash: string;
  otpSalt: string;
  otpExpiresAt: Date;
} {
  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpSalt = crypto.randomBytes(16).toString("hex");
  const otpHash = crypto
    .createHash("sha256")
    .update(otp + otpSalt)
    .digest("hex");
  const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute expiry
  return { otp, otpHash, otpSalt, otpExpiresAt };
}

// POST /api/trips (Driver starts a trip)
router.post(
  "/",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { rideId } = req.body;
      if (!rideId || !mongoose.Types.ObjectId.isValid(rideId)) {
        res
          .status(400)
          .json({ code: "BAD_REQUEST", message: "Valid rideId is required" });
        return;
      }

      const ride = await Ride.findById(rideId);
      if (!ride) {
        res.status(404).json({ code: "NOT_FOUND", message: "Ride not found" });
        return;
      }

      // Ownership check: only ride creator can start trip
      if (ride.creator.toString() !== req.user!.id) {
        res.status(403).json({
          code: "FORBIDDEN",
          message: "Unauthorized: Only the driver can start the trip",
        });
        return;
      }

      // Check if trip already exists
      let existingTrip = await Trip.findOne({
        rideId,
        status: { $in: ["scheduled", "in_progress"] },
      });
      if (existingTrip) {
        res.status(200).json(existingTrip);
        return;
      }

      // Get all accepted passengers
      const acceptedRequests = await RideRequest.find({
        rideId: ride._id,
        status: "accepted",
      });
      const passengerIds = acceptedRequests.map((r) => r.passengerId);

      // Cryptographically secure 6-digit OTP (§3.2)
      const { otp, otpHash, otpSalt, otpExpiresAt } = createSecureOtp();

      // Approximate trip distance
      const dist = haversineDistanceKm(ride.origin, ride.destination);

      const trip = await Trip.create({
        rideId: ride._id,
        driverId: ride.creator,
        passengerIds,
        startTime: new Date(),
        distance: Math.round(dist * 10) / 10,
        status: "in_progress",
        otpHash,
        otpSalt,
        otpExpiresAt,
        otpAttempts: 0,
        isLocked: false,
      });

      const populatedTrip = await Trip.findById(trip._id)
        .populate("driverId", "name email phone avatarURL rating")
        .populate("passengerIds", "name email phone avatarURL rating")
        .populate("rideId");

      const io = getSocketIO();
      if (io) {
        // Broadcast to ride room (never send plaintext OTP)
        io.to(`ride_${rideId}`).emit("tripUpdate", {
          tripId: trip._id,
          status: "in_progress",
          trip: populatedTrip,
        });
        // Notify all passenger personal rooms (never send OTP)
        passengerIds.forEach((pid) => {
          io.to(`user_${pid.toString()}`).emit("tripUpdate", {
            tripId: trip._id,
            status: "in_progress",
            trip: populatedTrip,
          });
        });
      }

      // Return trip object. Driver alone receives the generated OTP for pickup verification.
      const responsePayload = {
        ...populatedTrip!.toJSON(),
        otp, // provided strictly to the authenticated driver who started the trip
      };

      res.status(201).json(responsePayload);
    } catch (err: any) {
      console.error("Start trip error:", err);
      logger.error({ err }, "Start trip error");
      res.status(500).json({
        code: "SERVER_ERROR",
        message: err.message || "Failed to start trip",
      });
    }
  },
);

// GET /api/trips/:id
router.get(
  "/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      let trip;

      if (mongoose.Types.ObjectId.isValid(id)) {
        trip = await Trip.findById(id)
          .populate("driverId", "name email phone avatarURL rating")
          .populate("passengerIds", "name email phone avatarURL rating")
          .populate("rideId");
      }

      // If not found by Trip _id, try finding by rideId
      if (!trip && mongoose.Types.ObjectId.isValid(id)) {
        trip = await Trip.findOne({ rideId: id })
          .populate("driverId", "name email phone avatarURL rating")
          .populate("passengerIds", "name email phone avatarURL rating")
          .populate("rideId");
      }

      if (!trip) {
        res.status(404).json({ code: "NOT_FOUND", message: "Trip not found" });
        return;
      }

      // Participants check: user must be driver or a passenger
      const userId = req.user!.id;
      const driverIdStr =
        (trip.driverId as any)?._id?.toString() || trip.driverId?.toString();
      const isDriver = driverIdStr === userId;
      const isPassenger =
        Array.isArray(trip.passengerIds) &&
        trip.passengerIds.some((p: any) => {
          const pIdStr = p?._id?.toString() || p?.toString();
          return pIdStr === userId;
        });

      if (!isDriver && !isPassenger) {
        res.status(403).json({
          code: "FORBIDDEN",
          message: "Unauthorized to view this trip",
        });
        return;
      }

      // Notice: Trip.toJSON() automatically strips otpHash, otpSalt, and otp.
      // The passenger NEVER receives the OTP.
      res.status(200).json(trip);
    } catch (err: any) {
      res
        .status(500)
        .json({ code: "SERVER_ERROR", message: "Failed to fetch trip" });
    }
  },
);

// POST /api/trips/:id/verify-otp (Passenger verifies OTP at pickup)
router.post(
  "/:id/verify-otp",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { otp } = req.body;

      if (!otp) {
        res
          .status(400)
          .json({ code: "BAD_REQUEST", message: "OTP is required" });
        return;
      }

      const trip = await Trip.findById(id).select("+otpHash +otpSalt");
      if (!trip) {
        res.status(404).json({ code: "NOT_FOUND", message: "Trip not found" });
        return;
      }

      // Guardrail #12: Trip membership check (authenticated requester must be passenger or driver)
      const isPassenger = trip.passengerIds.some(
        (p: any) => p.toString() === req.user!.id,
      );
      const isDriver = trip.driverId.toString() === req.user!.id;
      if (!isPassenger && !isDriver) {
        res.status(403).json({
          code: "FORBIDDEN",
          message:
            "Unauthorized: Only passengers of this trip can verify pickup",
        });
        return;
      }

      // Check lockout (§3.2 max 5 attempts)
      if (trip.isLocked || trip.otpAttempts >= 5) {
        res.status(429).json({
          code: "OTP_LOCKED",
          message:
            "Maximum OTP verification attempts exceeded. Please ask your driver to regenerate a new OTP.",
        });
        return;
      }

      // Check expiry (§3.2 15-minute expiry)
      if (trip.otpExpiresAt && Date.now() > trip.otpExpiresAt.getTime()) {
        res.status(400).json({
          code: "OTP_EXPIRED",
          message:
            "OTP has expired. Please ask your driver to regenerate a new OTP.",
        });
        return;
      }

      // Timing-safe constant-time comparison (§3.2)
      const inputHash = crypto
        .createHash("sha256")
        .update(otp.toString().trim() + trip.otpSalt)
        .digest("hex");

      const expectedBuffer = Buffer.from(trip.otpHash, "hex");
      const inputBuffer = Buffer.from(inputHash, "hex");

      const isMatch =
        expectedBuffer.length === inputBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, inputBuffer);

      if (!isMatch) {
        trip.otpAttempts += 1;
        if (trip.otpAttempts >= 5) {
          trip.isLocked = true;
        }
        await trip.save();

        res.status(400).json({
          code: "INVALID_OTP",
          message: "Invalid OTP. Please check with your driver.",
          attemptsRemaining: Math.max(0, 5 - trip.otpAttempts),
        });
        return;
      }

      // Success: reset attempts
      trip.otpAttempts = 0;
      await trip.save();

      // OTP verified successfully
      const io = getSocketIO();
      if (io) {
        io.to(`user_${trip.driverId.toString()}`).emit("tripUpdate", {
          tripId: trip._id,
          status: trip.status,
          otpVerified: true,
          message: "Passenger verified pickup OTP",
        });
        io.to(`ride_${trip.rideId.toString()}`).emit("tripUpdate", {
          tripId: trip._id,
          status: trip.status,
          otpVerified: true,
        });
      }

      res.status(200).json({
        message: "OTP verified successfully. Boarding confirmed!",
        verified: true,
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ code: "SERVER_ERROR", message: "OTP verification failed" });
    }
  },
);

// POST /api/trips/:id/regenerate-otp (Driver regenerates OTP if locked or expired)
router.post(
  "/:id/regenerate-otp",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const trip = await Trip.findById(id);

      if (!trip) {
        res.status(404).json({ code: "NOT_FOUND", message: "Trip not found" });
        return;
      }

      // Ownership check: only driver can regenerate
      if (trip.driverId.toString() !== req.user!.id) {
        res.status(403).json({
          code: "FORBIDDEN",
          message: "Unauthorized: Only the driver can regenerate OTP",
        });
        return;
      }

      const { otp, otpHash, otpSalt, otpExpiresAt } = createSecureOtp();
      trip.otpHash = otpHash;
      trip.otpSalt = otpSalt;
      trip.otpExpiresAt = otpExpiresAt;
      trip.otpAttempts = 0;
      trip.isLocked = false;
      await trip.save();

      res.status(200).json({
        message: "New OTP generated successfully",
        otp,
        expiresAt: otpExpiresAt,
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ code: "SERVER_ERROR", message: "Failed to regenerate OTP" });
    }
  },
);

// PATCH /api/trips/:id (Complete trip or update status)
router.patch(
  "/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, distance } = req.body;

      const trip = await Trip.findById(id);
      if (!trip) {
        res.status(404).json({ code: "NOT_FOUND", message: "Trip not found" });
        return;
      }

      // Ownership check: driver only
      if (trip.driverId.toString() !== req.user!.id) {
        res.status(403).json({
          code: "FORBIDDEN",
          message: "Unauthorized: Only the driver can update trip status",
        });
        return;
      }

      // Guardrail #11: Validate trip transitions via server-controlled state machine
      const VALID_TRANSITIONS: Record<string, string[]> = {
        scheduled: [
          "driver_started",
          "pickup_verification",
          "in_progress",
          "cancelled",
        ],
        driver_started: [
          "pickup_verification",
          "in_progress",
          "cancelled",
          "no_show",
        ],
        pickup_verification: ["in_progress", "cancelled", "no_show"],
        in_progress: ["near_destination", "completed", "cancelled", "failed"],
        near_destination: ["completed", "failed"],
        completed: [],
        cancelled: [],
        no_show: [],
        failed: [],
      };

      if (status && status !== trip.status) {
        const allowed = VALID_TRANSITIONS[trip.status] || [];
        if (!allowed.includes(status)) {
          res.status(400).json({
            code: "INVALID_TRANSITION",
            message: `Cannot transition trip from '${trip.status}' to '${status}'. Allowed transitions: ${allowed.join(", ") || "none"}`,
          });
          return;
        }
        trip.status = status as any;
      }

      if (distance) {
        trip.distance = Number(distance);
        trip.actualDistanceKm = Number(distance);
      }

      if (status === "completed") {
        trip.endTime = new Date();

        // Mark ride as completed
        await Ride.findByIdAndUpdate(trip.rideId, { status: "completed" });

        // Increment totalRides and reliability stats
        await User.findByIdAndUpdate(trip.driverId, {
          $inc: {
            totalRides: 1,
            "reliabilityStats.completedRides": 1,
          },
        });
        await User.updateMany(
          { _id: { $in: trip.passengerIds } },
          {
            $inc: {
              totalRides: 1,
              "reliabilityStats.completedRides": 1,
            },
          },
        );

        await logAuditEvent({
          actorId: req.user!.id,
          actorRole: req.user!.role,
          action: "TRIP_COMPLETED",
          resourceType: "Trip",
          resourceId: trip._id.toString(),
          metadata: { distanceKm: trip.distance },
          req,
        });
      }

      await trip.save();

      const populatedTrip = await Trip.findById(id)
        .populate("driverId", "name email phone avatarURL rating")
        .populate("passengerIds", "name email phone avatarURL rating")
        .populate("rideId");

      const io = getSocketIO();
      if (io) {
        io.to(`ride_${trip.rideId.toString()}`).emit("tripUpdate", {
          tripId: trip._id,
          status: trip.status,
          trip: populatedTrip,
        });
        trip.passengerIds.forEach((pid) => {
          io.to(`user_${pid.toString()}`).emit("tripUpdate", {
            tripId: trip._id,
            status: trip.status,
            trip: populatedTrip,
          });
        });
      }

      res.status(200).json(populatedTrip);
    } catch (err: any) {
      res
        .status(500)
        .json({ code: "SERVER_ERROR", message: "Failed to update trip" });
    }
  },
);

// GET /api/trips/:id/locations (Authorized telemetry stream history)
router.get(
  "/:id/locations",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const trip = await Trip.findById(id);
      if (!trip) {
        res.status(404).json({ code: "NOT_FOUND", message: "Trip not found" });
        return;
      }

      const isParticipant =
        trip.driverId.toString() === req.user!.id ||
        trip.passengerIds.some((p) => p.toString() === req.user!.id) ||
        ["campus_admin", "super_admin", "moderator"].includes(
          req.user?.role || "",
        );

      if (!isParticipant) {
        res.status(403).json({
          code: "FORBIDDEN",
          message: "Unauthorized to access trip telemetry",
        });
        return;
      }

      const locations = await TripLocation.find({ tripId: id })
        .sort({ timestamp: 1 })
        .limit(300);

      res.status(200).json({ locations });
    } catch (err: any) {
      res.status(500).json({
        code: "SERVER_ERROR",
        message: "Failed to fetch trip locations",
      });
    }
  },
);

// GET /api/trips/:id/calendar.ics (RFC 5545 iCalendar standard download)
router.get(
  "/:id/calendar.ics",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const trip = await Trip.findById(id).populate("rideId driverId");
      if (!trip) {
        res.status(404).json({ code: "NOT_FOUND", message: "Trip not found" });
        return;
      }

      const ride: any = trip.rideId;
      const startTime = trip.startTime || new Date();
      const endTime =
        trip.endTime || new Date(startTime.getTime() + 45 * 60 * 1000);

      const formatIcsDate = (d: Date) =>
        d
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/, "");

      const icsData = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//CampusRide//Campus Commute Platform//EN",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:trip-${trip._id}@campusride.edu`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${formatIcsDate(startTime)}`,
        `DTEND:${formatIcsDate(endTime)}`,
        `SUMMARY:Campus Commute: ${ride?.origin?.name || "Campus"} to ${ride?.destination?.name || "Transit Hub"}`,
        `DESCRIPTION:CampusRide Commute Trip with ${(trip.driverId as any)?.name || "Driver"}. Trip ID: ${trip._id}`,
        `LOCATION:${ride?.origin?.name || "Campus Gate"}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="commute-${trip._id}.ics"`,
      );
      res.send(icsData);
    } catch (err: any) {
      res.status(500).json({
        code: "SERVER_ERROR",
        message: "Failed to generate calendar file",
      });
    }
  },
);

export default router;
