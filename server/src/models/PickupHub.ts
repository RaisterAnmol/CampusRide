import mongoose, { Document, Schema } from "mongoose";

export interface IPickupHub extends Document {
  _id: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  campusId: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  radiusMeters: number;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PickupHubSchema = new Schema<IPickupHub>(
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
    code: { type: String, uppercase: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: { type: String, required: true, trim: true },
    radiusMeters: { type: Number, default: 50 },
    description: { type: String, trim: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

PickupHubSchema.index({ campusId: 1, name: 1 });
PickupHubSchema.index({ location: "2dsphere" });

export const PickupHub = mongoose.model<IPickupHub>("PickupHub", PickupHubSchema);

