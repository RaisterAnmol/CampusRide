import mongoose, { Document, Schema } from "mongoose";

export interface IUserPreferences {
  womenOnlyDriver?: boolean;
  musicAllowed?: boolean;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
}

export interface IEmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface IReliabilityStats {
  onTimeDepartures: number;
  completedRides: number;
  cancellations: number;
  lateCancellations: number;
  noShows: number;
}

export type UserRole = "student" | "moderator" | "campus_admin" | "super_admin";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  college: string;
  year: number;
  department?: string;
  course?: string;
  semester?: number;
  institutionId?: mongoose.Types.ObjectId;
  campusId?: mongoose.Types.ObjectId;
  phone?: string;
  avatarURL?: string;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  isEmailVerified: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;
  isPhoneVerified: boolean;
  phoneOtpHash?: string;
  phoneOtpSalt?: string;
  phoneOtpExpires?: Date;
  phoneOtpAttempts?: number;
  rating: number;
  totalRides: number;
  reliabilityScore: number;
  reliabilityStats: IReliabilityStats;
  preferences: IUserPreferences;
  emergencyContact?: IEmergencyContact;
  emergencyContacts?: IEmergencyContact[];
  gender?: "male" | "female" | "other";
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "moderator", "campus_admin", "super_admin"],
      default: "student",
      index: true,
    },
    college: { type: String, required: true, trim: true, index: true },
    year: { type: Number, required: true, min: 1, max: 6, index: true },
    department: { type: String, trim: true, index: true, default: "Computer Science & Engineering" },
    course: { type: String, trim: true, index: true, default: "B.Tech" },
    semester: { type: Number, min: 1, max: 12, index: true, default: 5 },
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution" },
    campusId: { type: Schema.Types.ObjectId, ref: "Campus" },
    phone: { type: String, trim: true },
    avatarURL: { type: String, default: "" },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
      index: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    isPhoneVerified: { type: Boolean, default: false },
    phoneOtpHash: { type: String, select: false },
    phoneOtpSalt: { type: String, select: false },
    phoneOtpExpires: { type: Date, select: false },
    phoneOtpAttempts: { type: Number, default: 0, select: false },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    totalRides: { type: Number, default: 0, min: 0 },
    reliabilityScore: { type: Number, default: 100, min: 0, max: 100 },
    reliabilityStats: {
      onTimeDepartures: { type: Number, default: 0 },
      completedRides: { type: Number, default: 0 },
      cancellations: { type: Number, default: 0 },
      lateCancellations: { type: Number, default: 0 },
      noShows: { type: Number, default: 0 },
    },
    tokenVersion: { type: Number, default: 0 },
    preferences: {
      womenOnlyDriver: { type: Boolean, default: false },
      musicAllowed: { type: Boolean, default: true },
      smokingAllowed: { type: Boolean, default: false },
      petsAllowed: { type: Boolean, default: false },
    },
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relation: { type: String, default: "" },
    },
    emergencyContacts: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relation: { type: String },
      },
    ],
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.passwordHash;
        delete ret.emailVerificationTokenHash;
        delete ret.emailVerificationExpires;
        delete ret.phoneOtpHash;
        delete ret.phoneOtpSalt;
        delete ret.phoneOtpExpires;
        delete ret.phoneOtpAttempts;
        return ret;
      },
    },
  },
);

export const User = mongoose.model<IUser>("User", UserSchema);
