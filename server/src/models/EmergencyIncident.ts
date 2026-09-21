import mongoose, { Document, Schema } from "mongoose";

export interface IEmergencyIncident extends Document {
  _id: mongoose.Types.ObjectId;
  incidentNumber: string;
  tripId?: mongoose.Types.ObjectId;
  triggeredBy: mongoose.Types.ObjectId;
  institutionId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESPONDING" | "RESOLVED" | "FALSE_ALARM";
  emergencyContactsNotified: Array<{
    name: string;
    phone: string;
    relationship?: string;
    dispatchStatus: "SENT" | "FAILED" | "PENDING" | "MOCK_DEV_DISPATCHED";
    sentAt?: Date;
    error?: string;
  }>;
  campusSecurityNotified: boolean;
  securityNotes?: string;
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyIncidentSchema = new Schema<IEmergencyIncident>(
  {
    incidentNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      index: true,
    },
    triggeredBy: {
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
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: Number },
      address: { type: String },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "ACKNOWLEDGED", "RESPONDING", "RESOLVED", "FALSE_ALARM"],
      default: "ACTIVE",
      index: true,
    },
    emergencyContactsNotified: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relationship: { type: String },
        dispatchStatus: {
          type: String,
          enum: ["SENT", "FAILED", "PENDING", "MOCK_DEV_DISPATCHED"],
          default: "PENDING",
        },
        sentAt: { type: Date },
        error: { type: String },
      },
    ],
    campusSecurityNotified: {
      type: Boolean,
      default: false,
    },
    securityNotes: { type: String },
    acknowledgedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    acknowledgedAt: { type: Date },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

EmergencyIncidentSchema.index({ triggeredBy: 1, status: 1 });
EmergencyIncidentSchema.index({ tripId: 1, status: 1 });

export const EmergencyIncident = mongoose.model<IEmergencyIncident>(
  "EmergencyIncident",
  EmergencyIncidentSchema
);

