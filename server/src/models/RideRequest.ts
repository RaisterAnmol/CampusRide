import mongoose, { Document, Schema } from "mongoose";

export interface IRideRequest extends Document {
  _id: mongoose.Types.ObjectId;
  rideId: mongoose.Types.ObjectId;
  passengerId: mongoose.Types.ObjectId;
  requestedAt: Date;
  status: "pending" | "accepted" | "declined" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const RideRequestSchema = new Schema<IRideRequest>(
  {
    rideId: {
      type: Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
      index: true,
    },
    passengerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

RideRequestSchema.index({ rideId: 1, passengerId: 1 }, { unique: true });

export const RideRequest = mongoose.model<IRideRequest>(
  "RideRequest",
  RideRequestSchema,
);
