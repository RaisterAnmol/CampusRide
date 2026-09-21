import mongoose, { Document, Schema } from "mongoose";

export interface IFeatureFlag extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  institutionId?: mongoose.Types.ObjectId; // null = global default
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      default: null,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Compound index to guarantee unique flag per institution
FeatureFlagSchema.index({ key: 1, institutionId: 1 }, { unique: true });

export const FeatureFlag = mongoose.model<IFeatureFlag>(
  "FeatureFlag",
  FeatureFlagSchema
);
