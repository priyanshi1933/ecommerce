import mongoose, { Schema, Document,Types } from "mongoose";

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: {
    productId: Types.ObjectId;
    variantId: Types.ObjectId;
    quantity: number;
  }[];
}

const CartSchema: Schema<ICart> = new Schema<ICart>(
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
        variantId:{
            type: Schema.Types.ObjectId,
            required:true
        },
        quantity:{
            type:Number,
            required:true,
            default:1,
            min:1
        }
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const CartModel = mongoose.model<ICart>("Cart", CartSchema);
