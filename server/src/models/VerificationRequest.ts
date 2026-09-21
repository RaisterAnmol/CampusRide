import mongoose, { Document, Schema } from "mongoose";

export interface IVerificationRequest extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  institutionId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  studentIdentifier: string; // ID Card Number or Roll Number
  documentType: "student_id" | "enrollment_letter" | "staff_id";
  documentStorageKey: string; // Private storage key/filename, not public URL
  documentOriginalName?: string;
  documentMimeType?: string;
  documentSizeBytes?: number;
  status: "pending" | "approved" | "rejected";
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
    studentIdentifier: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      enum: ["student_id", "enrollment_letter", "staff_id"],
      required: true,
      default: "student_id",
    },
    documentStorageKey: {
      type: String,
      required: true,
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

export const VerificationRequest = mongoose.model<IVerificationRequest>(
  "VerificationRequest",
  VerificationRequestSchema
);

