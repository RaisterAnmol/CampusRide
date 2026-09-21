import mongoose, { Document, Schema } from "mongoose";

export interface IVehicle extends Omit<Document, "model"> {
  _id: mongoose.Types.ObjectId;
  ownerUserId: mongoose.Types.ObjectId;
  type: "car" | "bike";
  make?: string;
  model?: string;
  color?: string;
  capacity: number;
  plateLast4: string;
  verificationStatus: "pending" | "verified" | "rejected";
  rcDocumentKey?: string;
  insuranceDocumentKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["car", "bike"],
      required: true,
      default: "car",
    },
    make: { type: String, trim: true },
    model: { type: String, trim: true },
    color: { type: String, trim: true },
    capacity: { type: Number, required: true, min: 1, max: 8 },
    plateLast4: { type: String, required: true, trim: true, maxlength: 4 },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "verified",
      index: true,
    },
    rcDocumentKey: { type: String },
    insuranceDocumentKey: { type: String },
  },
  { timestamps: true },
);

export const Vehicle = mongoose.model<IVehicle>("Vehicle", VehicleSchema);
