import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: {
    productId: Types.ObjectId;
    variantId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color:string;
    size:string;
  }[];
  totalAmount: number;
  status: "Placed" | "Paid" | "Shipped" | "Delivered";
  statusTimeline: {
    status: string;
    updatedAt: Date;
  }[];
  idempotencyKey: string;
  paymentStatus: "Pending" | "Success" | "Failed";
}

const OrderSchema: Schema<IOrder> = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        color: { type: String },
        size: { type: String },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Placed", "Paid", "Shipped", "Delivered"],
      default: "Placed",
    },
    statusTimeline: [
      {
        status: { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    idempotencyKey: {
      type: String,
      unique: true,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
