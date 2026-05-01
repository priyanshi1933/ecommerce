import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFlashsale extends Document {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  salePrice: number;
  maxUnits: number;
  soldUnits: number;
  startTime: Date;
  endTime: Date;
  participants: Types.ObjectId[];
  isActive: boolean;
}

const FlashsaleSchema: Schema<IFlashsale> = new Schema<IFlashsale>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    salePrice: { type: Number, required: true },
    maxUnits: { type: Number, required: true },
    soldUnits: { type: Number, default: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const FlashsaleModel = mongoose.model<IFlashsale>(
  "Flashsale",
  FlashsaleSchema,
);
