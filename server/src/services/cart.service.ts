import { CartModel } from "../models/cart.model";
import { Types } from "mongoose";

export const addToCart = async (
  userId: string,
  productId: string,
  variantId: string,
  quantity: number,
) => {
  const uId = new Types.ObjectId(userId);
  const pId = new Types.ObjectId(productId);
  const vId = new Types.ObjectId(variantId);
  let cart = await CartModel.findOne({ userId: uId });
  if (!cart) {
    return await CartModel.create({
      userId: uId,
      items: [{ productId: pId, variantId: vId, quantity }],
    });
  }
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.equals(pId) && item.variantId.equals(vId),
  );
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId: pId, variantId: vId, quantity });
  }
  return await cart.save();
};

export const getCartByUserId = async (userId: string) => {
  return await CartModel.findOne({
    userId: new Types.ObjectId(userId),
  }).populate("items.productId");
};

export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  variantId: string,
  newQuantity: number,
) => {
  return await CartModel.findOneAndUpdate(
    {
      userId: new Types.ObjectId(userId),
      "items.productId": new Types.ObjectId(productId),
      "items.variantId": new Types.ObjectId(variantId),
    },
    { $set: { "items.$.quantity": newQuantity } },
    { new: true },
  ).populate("items.productId");
};

export const removeFromCart = async (
  userId: string,
  productId: string,
  variantId: string,
) => {
  const updatedCart = await CartModel.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    {
      $pull: {
        items: {
          productId: new Types.ObjectId(productId),
          variantId: new Types.ObjectId(variantId),
        },
      },
    },
    { new: true },
  ).populate("items.productId");
  if (updatedCart && updatedCart.items.length === 0) {
    await CartModel.findByIdAndDelete(updatedCart._id);
    return null;
  }
  return updatedCart;
};

export const clearCart = async (userId: string) => {
  return await CartModel.findByIdAndDelete({
    userId: new Types.ObjectId(userId),
  });
};
