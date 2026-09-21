import mongoose, { Document, Schema } from "mongoose";

export interface IGeofence extends Document {
  _id: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  campusId: mongoose.Types.ObjectId;
  name: string;
  type: "campus_boundary" | "speed_restricted" | "no_pickup" | "hub_buffer";
  center: {
    latitude: number;
    longitude: number;
  };
  radiusMeters: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GeofenceSchema = new Schema<IGeofence>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
    campusId: {
      type: Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["campus_boundary", "speed_restricted", "no_pickup", "hub_buffer"],
      required: true,
      default: "campus_boundary",
    },
    center: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    radiusMeters: { type: Number, required: true, min: 10 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

GeofenceSchema.index({ campusId: 1, type: 1 });

export const Geofence = mongoose.model<IGeofence>("Geofence", GeofenceSchema);

