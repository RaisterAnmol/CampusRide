import mongoose, { Schema, Document } from "mongoose";

export interface IInstitution extends Document {
  name: string;
  code: string;
  domain: string;
  allowedDomains: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, uppercase: true, trim: true, default: "CAMPUS" },
    domain: { type: String, required: true, lowercase: true, trim: true },
    allowedDomains: [{ type: String, lowercase: true, trim: true }],
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Institution = mongoose.model<IInstitution>(
  "Institution",
  InstitutionSchema,
);
