import mongoose, { Document, Schema } from "mongoose";

export interface IVerificationRequest extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  institutionId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  accountType?: "PASSENGER" | "WOMEN_PASSENGER" | "DRIVER" | "ADMIN";
  role?: string;
  studentIdentifier: string; // ID Card Number or Roll Number
  driverIdentifier?: string; // Driver License Number
  documentType?: "student_id" | "enrollment_letter" | "staff_id" | "driving_license" | "selfie";
  documentStorageKey?: string; // Legacy field for backwards compatibility
  idDocumentStorageKey?: string; // Private storage key for Student / Org ID
  drivingLicenseStorageKey?: string; // Private storage key for Driver License
  selfieStorageKey?: string; // Private storage key for Selfie
  documentOriginalName?: string;
  documentMimeType?: string;
  documentSizeBytes?: number;
  status: "pending" | "approved" | "rejected";
  submittedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationRequestSchema = new Schema<IVerificationRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
    },
    campusId: {
      type: Schema.Types.ObjectId,
      ref: "Campus",
    },
    accountType: {
      type: String,
      enum: ["PASSENGER", "WOMEN_PASSENGER", "DRIVER", "ADMIN"],
      default: "PASSENGER",
      index: true,
    },
    role: {
      type: String,
      default: "student",
    },
    studentIdentifier: {
      type: String,
      required: true,
      trim: true,
    },
    driverIdentifier: {
      type: String,
      trim: true,
    },
    documentType: {
      type: String,
      enum: ["student_id", "enrollment_letter", "staff_id", "driving_license", "selfie"],
      default: "student_id",
    },
    documentStorageKey: {
      type: String,
      trim: true,
    },
    idDocumentStorageKey: {
      type: String,
      trim: true,
    },
    drivingLicenseStorageKey: {
      type: String,
      trim: true,
    },
    selfieStorageKey: {
      type: String,
      trim: true,
    },
    documentOriginalName: { type: String, trim: true },
    documentMimeType: { type: String, trim: true },
    documentSizeBytes: { type: Number },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

VerificationRequestSchema.index({ userId: 1, status: 1 });
VerificationRequestSchema.index({ accountType: 1, status: 1 });

export const VerificationRequest = mongoose.model<IVerificationRequest>(
  "VerificationRequest",
  VerificationRequestSchema
);

