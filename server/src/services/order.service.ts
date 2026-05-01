import { OrderModel } from "../models/order.model";
import { CartModel } from "../models/cart.model";
import { ProductModel } from "../models/product.model";
import { Types } from "mongoose";

export const createOrder = async (userId: string, idempotencyKey: string,paymentStatus: string = "Pending") => {
  const existingOrder = await OrderModel.findOne({ idempotencyKey });
  if (existingOrder) return existingOrder;
  const cart = await CartModel.findOne({
    userId: new Types.ObjectId(userId),
  }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty");
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const populatedProduct = item.productId as any;
    const product = await ProductModel.findById(populatedProduct._id);
    if (!product) {
      throw new Error(
        `Product ${populatedProduct.name || "Unknown"} no longer exists`,
      );
    }
    const variant = (product.variants as any).id(item.variantId);

    if (!variant) {
      throw new Error(
        `The selected variant for ${product.name} is no longer available`,
      );
    }
    if (variant.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name} (${variant.color}/${variant.size}). Only ${variant.stock} left.`,
      );
    }
    variant.stock -= item.quantity;
    await product.save();

    const itemPrice = variant.price;
    const itemTotal = itemPrice * item.quantity;
    totalAmount += itemTotal;

    const variantIndex = product.variants.findIndex(
      (v: any) => v._id.toString() === item.variantId.toString(),
    );

    const selectedImage = product.image[variantIndex] || product.image[0];

    orderItems.push({
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      price: itemPrice,
      quantity: item.quantity,
      image: selectedImage,
      color:variant.color,
      size:variant.size,
    });
  }

  const newOrder = await OrderModel.create({
    userId: new Types.ObjectId(userId),
    items: orderItems,
    totalAmount,
    idempotencyKey,
    paymentStatus: paymentStatus,
    status: "Placed",
    statusTimeline: [{ status: "Placed", updatedAt: new Date() }],
  });

  await CartModel.findOneAndUpdate(
    { userId: new Types.ObjectId(userId) },
    { $set: { items: [] } },
  );

  return newOrder;
};

export const getOrderById = async (orderId: string) => {
  return await OrderModel.findById(orderId).populate("userId", "name email").populate("items.productId");
};

export const getAllOrdersForAdmin = async () => {
  return await OrderModel.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
};

export const getUserOrders = async (userId: string) => {
  return await OrderModel.find({ userId: new Types.ObjectId(userId) }).sort({
    createdAt: -1,
  });
};

export const deleteOrder = async (orderId: string) => {
  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }
  for (const item of order.items) {
    const product = await ProductModel.findById(item.productId);

    if (product) {
      const variant = (product.variants as any).id(item.variantId);

      if (variant) {
        variant.stock += item.quantity;
        await product.save();
      }
    }
  }
  return await OrderModel.findByIdAndDelete(orderId);
};
