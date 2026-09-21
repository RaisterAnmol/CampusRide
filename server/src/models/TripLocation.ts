import mongoose, { Document, Schema } from "mongoose";

export interface ITripLocation extends Document {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number; // m/s
  heading?: number; // degrees
  timestamp: Date;
  distanceFromRouteMeters?: number;
  isDeviation?: boolean;
  createdAt: Date;
}

const TripLocationSchema = new Schema<ITripLocation>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    accuracy: { type: Number },
    speed: { type: Number, min: 0 },
    heading: { type: Number, min: 0, max: 360 },
    timestamp: { type: Date, default: Date.now, required: true },
    distanceFromRouteMeters: { type: Number },
    isDeviation: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
      // 30 days TTL expiration (30 * 86400 seconds)
      expires: 30 * 24 * 60 * 60,
      index: true,
    },
  },
  { timestamps: false }
);

TripLocationSchema.index({ tripId: 1, timestamp: -1 });

export const TripLocation = mongoose.model<ITripLocation>(
  "TripLocation",
  TripLocationSchema
);

