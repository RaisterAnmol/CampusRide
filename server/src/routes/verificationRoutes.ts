import { Router, Response } from "express";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import multer from "multer";
import { VerificationRequest } from "../models/VerificationRequest";
import { User } from "../models/User";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { logAuditEvent } from "../services/auditService";
import { NotificationService } from "../services/notificationService";

const router = Router();

// Private uploads directory outside static serving (§16)
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads/verification");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".webp";
    const rand = crypto.randomBytes(16).toString("hex");
    cb(null, `${rand}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("INVALID_FILE_TYPE"));
    }
  },
});

// Helper to save base64 data URL to private file (§15)
function saveBase64Image(dataUrl: string, prefix: string): { key: string; mimeType: string; size: number } | null {
  try {
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    if (buffer.length > 5 * 1024 * 1024) return null; // 5 MB check
    const ext = mimeType.split("/")[1] || "webp";
    const filename = `${prefix}-${crypto.randomBytes(16).toString("hex")}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return { key: filename, mimeType, size: buffer.length };
  } catch (err) {
    return null;
  }
}

// POST /api/verification/request (Submit verification documents & selfie)
router.post(
  "/request",
  requireAuth,
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ code: "NOT_FOUND", message: "User not found" });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const body = req.body || {};

      let idKey = files?.idDocument?.[0]?.filename;
      let licenseKey = files?.drivingLicense?.[0]?.filename;
      let selfieKey = files?.selfie?.[0]?.filename;

      // Also support base64 payload from webcam/canvas capture
      if (!idKey && body.idDocumentBase64) {
        const saved = saveBase64Image(body.idDocumentBase64, "id");
        if (saved) idKey = saved.key;
      }
      if (!licenseKey && body.drivingLicenseBase64) {
        const saved = saveBase64Image(body.drivingLicenseBase64, "license");
        if (saved) licenseKey = saved.key;
      }
      if (!selfieKey && body.selfieBase64) {
        const saved = saveBase64Image(body.selfieBase64, "selfie");
        if (saved) selfieKey = saved.key;
      }

      const studentIdentifier = (body.studentIdentifier || user.email.split("@")[0] || "STUDENT-ID").trim();
      const driverIdentifier = body.driverIdentifier?.trim();
      const accountType = body.accountType || user.accountType || "PASSENGER";

      if (!idKey) {
        res.status(400).json({
          code: "MISSING_ID_DOCUMENT",
          message: "University / Student ID document is required.",
        });
        return;
      }

      if (accountType === "DRIVER" && !licenseKey) {
        res.status(400).json({
          code: "MISSING_DRIVING_LICENSE",
          message: "Driving License is required for Driver accounts.",
        });
        return;
      }

      if (!selfieKey) {
        res.status(400).json({
          code: "MISSING_SELFIE",
          message: "Verification selfie photo is required.",
        });
        return;
      }

      // Check if user has an existing request
      let verificationReq = await VerificationRequest.findOne({ userId: user._id });
      if (verificationReq && verificationReq.status === "approved") {
        res.status(400).json({
          code: "ALREADY_VERIFIED",
          message: "Account is already verified and approved.",
        });
        return;
      }

      if (verificationReq) {
        // Update existing pending or rejected request
        verificationReq.studentIdentifier = studentIdentifier;
        if (driverIdentifier) verificationReq.driverIdentifier = driverIdentifier;
        verificationReq.accountType = accountType;
        verificationReq.role = user.role;
        verificationReq.idDocumentStorageKey = idKey;
        verificationReq.documentStorageKey = idKey;
        if (licenseKey) verificationReq.drivingLicenseStorageKey = licenseKey;
        verificationReq.selfieStorageKey = selfieKey;
        verificationReq.status = "pending";
        verificationReq.submittedAt = new Date();
        verificationReq.rejectionReason = undefined;
        await verificationReq.save();
      } else {
        verificationReq = await VerificationRequest.create({
          userId: user._id,
          institutionId: user.institutionId,
          campusId: user.campusId,
          studentIdentifier,
          driverIdentifier,
          accountType,
          role: user.role,
          idDocumentStorageKey: idKey,
          documentStorageKey: idKey,
          drivingLicenseStorageKey: licenseKey,
          selfieStorageKey: selfieKey,
          status: "pending",
          submittedAt: new Date(),
        });
      }

      // Store face descriptor on user if passed from Human quality gate
      if (Array.isArray(body.faceEmbedding) && body.faceEmbedding.length > 0) {
        user.faceEmbedding = body.faceEmbedding;
        user.faceEnrollmentStatus = "PENDING";
      }

      user.verificationStatus = "pending";
      await user.save();

      await logAuditEvent({
        actorId: user._id.toString(),
        actorRole: user.role,
        action: "VERIFICATION_SUBMITTED",
        resourceType: "VerificationRequest",
        resourceId: verificationReq._id.toString(),
        metadata: { accountType, hasLicense: Boolean(licenseKey) },
        req,
      });

      res.status(201).json({
        message: "Verification request submitted successfully. Awaiting administrative review.",
        request: verificationReq,
      });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to submit verification request" });
    }
  }
);

// GET /api/verification/my-request
router.get(
  "/my-request",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const request = await VerificationRequest.findOne({ userId: req.user!.id }).sort({ createdAt: -1 });
      res.status(200).json({ request });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch verification status" });
    }
  }
);

// GET /api/verification/queue (Admin Review Queue §20)
router.get(
  "/queue",
  requireAuth,
  requireRole("campus_admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { status, accountType, role, search } = req.query;
      const filter: any = {};

      if (status && status !== "all") {
        filter.status = status;
      }
      if (accountType && accountType !== "all") {
        filter.accountType = accountType;
      }
      if (role && role !== "all") {
        filter.role = role;
      }

      let requests = await VerificationRequest.find(filter)
        .populate("userId", "name email phone college year department course semester avatarURL role accountType verificationStatus faceEnrollmentStatus")
        .sort({ submittedAt: -1, createdAt: -1 })
        .limit(100);

      if (search && typeof search === "string" && search.trim()) {
        const q = search.trim().toLowerCase();
        requests = requests.filter((r: any) => {
          const u = r.userId || {};
          return (
            (u.name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (r.studentIdentifier || "").toLowerCase().includes(q) ||
            (r.driverIdentifier || "").toLowerCase().includes(q)
          );
        });
      }

      res.status(200).json({ requests });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to fetch review queue" });
    }
  }
);

// GET /api/verification/requests/:id
router.get(
  "/requests/:id",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const vReq = await VerificationRequest.findById(id).populate(
        "userId",
        "name email phone college year department course semester avatarURL role accountType verificationStatus faceEnrollmentStatus"
      );
      if (!vReq) {
        res.status(404).json({ code: "NOT_FOUND", message: "Verification request not found" });
        return;
      }

      const isOwner = req.user!.id === vReq.userId._id.toString();
      const isAdmin = ["campus_admin", "super_admin"].includes(req.user!.role || "");
      if (!isOwner && !isAdmin) {
        res.status(403).json({ code: "FORBIDDEN", message: "Unauthorized access to verification request" });
        return;
      }

      res.status(200).json({ request: vReq });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to load verification request" });
    }
  }
);

// POST /api/verification/requests/:id/approve (§21, §26)
router.post(
  "/requests/:id/approve",
  requireAuth,
  requireRole("campus_admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const vReq = await VerificationRequest.findById(id);
      if (!vReq) {
        res.status(404).json({ code: "NOT_FOUND", message: "Verification request not found" });
        return;
      }

      vReq.status = "approved";
      vReq.reviewedBy = req.user!.id as any;
      vReq.reviewedAt = new Date();
      if (adminNotes) vReq.adminNotes = adminNotes;
      await vReq.save();

      const targetUser = await User.findById(vReq.userId);
      if (targetUser) {
        targetUser.verificationStatus = "verified";
        if (targetUser.faceEnrollmentStatus === "PENDING") {
          targetUser.faceEnrollmentStatus = "ENROLLED";
          targetUser.faceVerificationEnabled = true;
        }
        await targetUser.save();

        await NotificationService.createPersistentNotification({
          userId: targetUser._id.toString(),
          type: "VERIFICATION_STATUS",
          title: "CampusRide Identity Verified!",
          body: "Your identity documents have been approved by Campus Administration. Access enabled.",
          channels: ["in_app", "socket"],
        });
      }

      await logAuditEvent({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        action: "VERIFICATION_APPROVED",
        resourceType: "VerificationRequest",
        resourceId: id,
        metadata: { targetUserId: vReq.userId },
        req,
      });

      res.status(200).json({ message: "Verification approved successfully", request: vReq });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to approve verification request" });
    }
  }
);

// POST /api/verification/requests/:id/reject (§21, §26)
router.post(
  "/requests/:id/reject",
  requireAuth,
  requireRole("campus_admin", "super_admin"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { rejectionReason, adminNotes } = req.body;

      if (!rejectionReason || typeof rejectionReason !== "string" || rejectionReason.trim().length < 3) {
        res.status(400).json({
          code: "REJECTION_REASON_REQUIRED",
          message: "A meaningful rejection reason is required.",
        });
        return;
      }

      const vReq = await VerificationRequest.findById(id);
      if (!vReq) {
        res.status(404).json({ code: "NOT_FOUND", message: "Verification request not found" });
        return;
      }

      vReq.status = "rejected";
      vReq.rejectionReason = rejectionReason.trim();
      vReq.reviewedBy = req.user!.id as any;
      vReq.reviewedAt = new Date();
      if (adminNotes) vReq.adminNotes = adminNotes;
      await vReq.save();

      const targetUser = await User.findById(vReq.userId);
      if (targetUser) {
        targetUser.verificationStatus = "rejected";
        await targetUser.save();

        await NotificationService.createPersistentNotification({
          userId: targetUser._id.toString(),
          type: "VERIFICATION_STATUS",
          title: "Verification Request Declined",
          body: `Your verification request was declined: ${rejectionReason.trim()}. You can upload new documents to resubmit.`,
          channels: ["in_app", "socket"],
        });
      }

      await logAuditEvent({
        actorId: req.user!.id,
        actorRole: req.user!.role,
        action: "VERIFICATION_REJECTED",
        resourceType: "VerificationRequest",
        resourceId: id,
        metadata: { targetUserId: vReq.userId, rejectionReason },
        req,
      });

      res.status(200).json({ message: "Verification rejected", request: vReq });
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to reject verification request" });
    }
  }
);

// GET /api/verification/requests/:id/document/:type (Protected Document Access §16, §17)
router.get(
  "/requests/:id/document/:type",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id, type } = req.params;
      const vReq = await VerificationRequest.findById(id);
      if (!vReq) {
        res.status(404).json({ code: "NOT_FOUND", message: "Verification request not found" });
        return;
      }

      const isOwner = req.user!.id === vReq.userId.toString();
      const isAdmin = ["campus_admin", "super_admin"].includes(req.user!.role || "");
      if (!isOwner && !isAdmin) {
        res.status(403).json({ code: "FORBIDDEN", message: "Access denied to protected document" });
        return;
      }

      let storageKey: string | undefined;
      if (type === "id" || type === "student_id") {
        storageKey = vReq.idDocumentStorageKey || vReq.documentStorageKey;
      } else if (type === "license" || type === "driving_license") {
        storageKey = vReq.drivingLicenseStorageKey;
      } else if (type === "selfie") {
        storageKey = vReq.selfieStorageKey;
      } else {
        res.status(400).json({ code: "INVALID_DOCUMENT_TYPE", message: "Supported types: id, license, selfie" });
        return;
      }

      if (!storageKey) {
        res.status(404).json({ code: "DOCUMENT_NOT_FOUND", message: `No ${type} document uploaded` });
        return;
      }

      const safeFilename = path.basename(storageKey);
      const filePath = path.join(UPLOAD_DIR, safeFilename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ code: "FILE_NOT_FOUND", message: "Document file not found on disk" });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeMap: { [ext: string]: string } = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
      };
      const contentType = mimeMap[ext] || "application/octet-stream";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
      res.sendFile(filePath);
    } catch (err: any) {
      res.status(500).json({ code: "SERVER_ERROR", message: "Failed to retrieve document" });
    }
  }
);

export default router;

