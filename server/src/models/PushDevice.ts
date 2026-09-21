import mongoose, { Document, Schema } from "mongoose";

export interface IPushDevice extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  platform: "web" | "android" | "ios";
  endpoint?: string;
  authSecret?: string;
  p256dhKey?: string;
  active: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PushDeviceSchema = new Schema<IPushDevice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ["web", "android", "ios"],
      required: true,
      default: "web",
    },
    endpoint: { type: String },
    authSecret: { type: String },
    p256dhKey: { type: String },
    active: { type: Boolean, default: true },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PushDevice = mongoose.model<IPushDevice>(
  "PushDevice",
  PushDeviceSchema
);

