import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemPricing extends Document {
  minPricePerSeat: number;
  basePrice: number;
  pricePerKm: number;
  localTransitComparison: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemPricingSchema = new Schema<ISystemPricing>(
  {
    minPricePerSeat: {
      type: Number,
      required: true,
      default: 10,
      min: [10, 'Minimum price must be at least ₹10'],
    },
    basePrice: {
      type: Number,
      required: true,
      default: 15,
      min: 10,
    },
    pricePerKm: {
      type: Number,
      required: true,
      default: 4.5,
      min: 1,
    },
    localTransitComparison: {
      type: String,
      default: 'Dehradun local transit standard: Minimum shared hop ₹10-₹15, Selaqui campus corridor ₹25-₹35, ISBT connector ₹45-₹60.',
    },
    updatedBy: {
      type: String,
      default: 'Campus Transport Dean / Admin',
    },
  },
  { timestamps: true }
);

export const SystemPricing = mongoose.model<ISystemPricing>('SystemPricing', SystemPricingSchema);
