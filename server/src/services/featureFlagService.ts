import mongoose from "mongoose";
import { FeatureFlag } from "../models/FeatureFlag";

export class FeatureFlagService {
  /**
   * Evaluates if a feature flag is enabled for a specific institution or globally.
   */
  static async isEnabled(key: string, institutionId?: string | mongoose.Types.ObjectId): Promise<boolean> {
    // 1. Check for institution-specific override
    if (institutionId) {
      const instFlag = await FeatureFlag.findOne({
        key,
        institutionId: new mongoose.Types.ObjectId(institutionId.toString()),
      });
      if (instFlag) {
        return instFlag.isEnabled;
      }
    }

    // 2. Fall back to global flag (institutionId is null)
    const globalFlag = await FeatureFlag.findOne({
      key,
      institutionId: null,
    });

    return globalFlag ? globalFlag.isEnabled : false;
  }

  /**
   * Sets or toggles a feature flag for an institution or globally.
   */
  static async setFlag(
    key: string,
    isEnabled: boolean,
    name: string,
    institutionId?: string | mongoose.Types.ObjectId,
    description?: string
  ) {
    const instId = institutionId ? new mongoose.Types.ObjectId(institutionId.toString()) : null;

    return FeatureFlag.findOneAndUpdate(
      { key, institutionId: instId },
      {
        $set: {
          key,
          name,
          isEnabled,
          institutionId: instId,
          description,
        },
      },
      { upsert: true, new: true }
    );
  }
}
