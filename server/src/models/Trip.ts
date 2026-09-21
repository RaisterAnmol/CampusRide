import mongoose, { Document, Schema } from "mongoose";

export type TripStatus =
  | "scheduled"
  | "driver_started"
  | "pickup_verification"
  | "in_progress"
  | "near_destination"
  | "completed"
  | "cancelled"
  | "no_show"
  | "failed";

export interface ITrip extends Document {
  _id: mongoose.Types.ObjectId;
  rideId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  passengerIds: mongoose.Types.ObjectId[];
  startTime?: Date;
  endTime?: Date;
  distance: number; // in km (legacy compatibility)
  plannedDistanceKm: number;
  actualDistanceKm: number;
  status: TripStatus;
  currentDeviationStatus?: "none" | "low" | "medium" | "high";
  deviationCount?: number;
  lastDeviationAt?: Date;
  routePolyline?: string;
  otpHash: string;
  otpSalt: string;
  otpExpiresAt: Date;
  otpAttempts: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    rideId: {
      type: Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
      index: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    passengerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    startTime: { type: Date },
    endTime: { type: Date },
    distance: { type: Number, default: 0 },
    plannedDistanceKm: { type: Number, default: 0 },
    actualDistanceKm: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "scheduled",
        "driver_started",
        "pickup_verification",
        "in_progress",
        "near_destination",
        "completed",
        "cancelled",
        "no_show",
        "failed",
      ],
      default: "scheduled",
      index: true,
    },
    currentDeviationStatus: {
      type: String,
      enum: ["none", "low", "medium", "high"],
      default: "none",
    },
    deviationCount: { type: Number, default: 0 },
    lastDeviationAt: { type: Date },
    routePolyline: { type: String },
    otpHash: {
      type: String,
      required: true,
      select: false, // never selected by default
    },
    otpSalt: {
      type: String,
      required: true,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).otpHash;
        delete (ret as any).otpSalt;
        delete (ret as any).otp;
        return ret;
      },
    },
  },
);

export const Trip = mongoose.model<ITrip>("Trip", TripSchema);
