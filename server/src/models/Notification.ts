import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type:
    | "TRIP_UPDATE"
    | "EMERGENCY_SOS"
    | "RIDE_REQUEST"
    | "VERIFICATION_STATUS"
    | "CHAT_MESSAGE"
    | "SECURITY_ALERT"
    | "SYSTEM";
  title: string;
  body: string;
  data?: Record<string, any>;
  readAt?: Date;
  deliveryChannels: Array<"in_app" | "socket" | "fcm" | "sms">;
  deliveryStatus: Record<string, "sent" | "failed" | "pending" | "mock_delivered">;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "TRIP_UPDATE",
        "EMERGENCY_SOS",
        "RIDE_REQUEST",
        "VERIFICATION_STATUS",
        "CHAT_MESSAGE",
        "SECURITY_ALERT",
        "SYSTEM",
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    data: { type: Schema.Types.Mixed },
    readAt: { type: Date, index: true },
    deliveryChannels: {
      type: [String],
      enum: ["in_app", "socket", "fcm", "sms"],
      default: ["in_app", "socket"],
    },
    deliveryStatus: {
      type: Map,
      of: String,
      default: {},
    },
    expiresAt: { type: Date, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

