import { Router, Response } from "express";
import crypto from "crypto";
import { VerificationRequest } from "../models/VerificationRequest";
import { User } from "../models/User";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { logAuditEvent } from "../services/auditService";
import { NotificationService } from "../services/notificationService";

const router = Router();

// POST /api/verification/request (Student submits verification request)
router.post(
  "/request",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }

      // Check if active pending request already exists
      const existingPending = await VerificationRequest.findOne({
        userId: user._id,
        status: "pending",
      });
      if (existingPending) {
        res.status(409).json({
          code: "REQUEST_EXISTS",
          message: "A verification request is already pending administrative review.",
          request: existingPending,
        });
        return;
      }

      const { studentIdentifier, documentType, documentMimeType, documentSizeBytes } = req.body;
      if (!studentIdentifier || typeof studentIdentifier !== "string") {
        res.status(400).json({ code: "BAD_REQUEST", message: "Student Roll / ID number is required" });
        return;
      }

      // Validate allowed MIME types (Guardrail #24)
      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      const mime = documentMimeType || "image/jpeg";
      if (!allowedMimes.includes(mime)) {
        res.status(400).json({
          code: "INVALID_MIME_TYPE",
          message: "Document must be JPEG, PNG, WebP or PDF format",
        });
        return;
      }

      // Max 5 MB check
      const maxBytes = 5 * 1024 * 1024;
      if (documentSizeBytes && documentSizeBytes > maxBytes) {
        res.status(400).json({
          code: "FILE_TOO_LARGE",
          message: "Document file size exceeds 5MB limit",
        });
        return;
      }

      // Generate private cryptographic storage key (never use untrusted client filename)
      const safeKey = `docs/${user._id}/${crypto.randomBytes(16).toString("hex")}.${mime.split("/")[1]}`;

      const verificationReq = await VerificationRequest.create({
        userId: user._id,
        institutionId: user.institutionId,
        campusId: user.campusId,
        studentIdentifier: studentIdentifier.trim(),
        documentType: documentType || "student_id",
        documentStorageKey: safeKey,
        documentMimeType: mime,
        documentSizeBytes: documentSizeBytes || 250000,
        status: "pending",
      });

      user.verificationStatus = "pending";
      await user.save();

      await logAuditEvent({
        actorId: user._id.toString(),
        actorRole: user.role,
        action: "SUBMITTED_VERIFICATION_REQUEST",
        resourceType: "VerificationRequest",
        resourceId: verificationReq._id.toString(),
        req,
      });

      res.status(201).json({
        message: "Student ID submitted successfully for institutional verification.",
        request: verificationReq,
      });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to submit verification request" });
    }
  }
);

// GET /api/verification/my-request (Current user's verification state)
router.get(
  "/my-request",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = await VerificationRequest.findOne({ userId: req.user!.id })
        .sort({ createdAt: -1 });

      res.status(200).json({ request });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch verification status" });
    }
  }
);

// GET /api/verification/queue (Admin Review Queue)
router.get(
  "/queue",
  requireAuth,
  requireRole("campus_admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { status = "pending" } = req.query;
      const requests = await VerificationRequest.find({ status })
        .populate("userId", "name email phone college year avatarURL role")
        .sort({ createdAt: 1 })
        .limit(50);

      res.status(200).json({ requests });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch review queue" });
    }
  }
);

// PATCH /api/verification/requests/:id/review (Admin approves or rejects student)
router.patch(
  "/requests/:id/review",
  requireAuth,
  requireRole("campus_admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { decision, rejectionReason, adminNotes } = req.body;

      if (!["approved", "rejected"].includes(decision)) {
        res.status(400).json({ code: "BAD_REQUEST", message: "Decision must be 'approved' or 'rejected'" });
        return;
      }

      const vReq = await VerificationRequest.findById(id);
      if (!vReq) {
        res.status(404).json({ code: "NOT_FOUND", message: "Verification request not found" });
        return;
      }

      vReq.status = decision;
      vReq.reviewedBy = req.user!.id as any;
      vReq.reviewedAt = new Date();
      if (rejectionReason) vReq.rejectionReason = rejectionReason;
      if (adminNotes) vReq.adminNotes = adminNotes;
      await vReq.save();

      // Update target student user
      const targetUser = await User.findById(vReq.userId);
      if (targetUser) {
        targetUser.verificationStatus = decision === "approved" ? "verified" : "rejected";
        await targetUser.save();

        // Send persistent notification to user
        await NotificationService.createPersistentNotification({
          userId: targetUser._id.toString(),
          type: "VERIFICATION_STATUS",
          title: decision === "approved" ? "Student ID Verified!" : "Verification Update",
          body: decision === "approved"
            ? "Your campus student credentials have been verified by administration. You can now offer and join rides."
            : `Your verification request was declined: ${rejectionReason || "Please upload a clearer student ID."}`,
          channels: ["in_app", "socket"],
        });
      }

      await logAuditEvent({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        action: decision === "approved" ? "STUDENT_VERIFICATION_APPROVED" : "STUDENT_VERIFICATION_REJECTED",
        resourceType: "VerificationRequest",
        resourceId: id,
        metadata: { targetUserId: vReq.userId, rejectionReason },
        req,
      });

      res.status(200).json({
        message: `Student verification ${decision}`,
        request: vReq,
      });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to review verification request" });
    }
  }
);

export default router;

