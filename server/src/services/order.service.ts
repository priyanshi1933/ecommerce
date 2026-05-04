import { OrderModel } from "../models/order.model";
import { CartModel } from "../models/cart.model";
import { ProductModel } from "../models/product.model";
import { FlashsaleModel } from "../models/flashsale.model";
import { Types } from "mongoose";

export const createOrder = async (userId: string, idempotencyKey: string, paymentStatus: string = "Pending") => {
  const existingOrder = await OrderModel.findOne({ idempotencyKey });
  if (existingOrder) return existingOrder;

  const cart = await CartModel.findOne({
    userId: new Types.ObjectId(userId),
  }).populate("items.productId");

  if (!cart || cart.items.length === 0) throw new Error("Your cart is empty");

  const now = new Date();
  const activeSales = await FlashsaleModel.find({
    startTime: { $lte: now },
    endTime: { $gte: now },
    isActive: true
  });

  let totalAmount = 0;
  const orderItems = [];


  for (const item of cart.items) {
    const populatedProduct = item.productId as any;
    const product = await ProductModel.findById(populatedProduct._id);
    if (!product) throw new Error(`Product ${populatedProduct.name} no longer exists`);

    const variant = (product.variants as any).id(item.variantId);
    if (!variant) throw new Error(`Variant for ${product.name} no longer available`);

    if (variant.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

    const activeSale = activeSales.find(s => 
      s.productId.toString() === product._id.toString() && 
      s.variantId.toString() === variant._id.toString()
    );

    const itemPrice = activeSale ? activeSale.salePrice : variant.price;

    // FIX: Get the image saved in the cart item. 
    // Fallback to the first product image only if the saved one is missing.
    const imageToSave = (item as any).selectedImage || product.image[0];

    variant.stock -= item.quantity;
    await product.save();

    const itemTotal = itemPrice * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      productId: product._id,
      variantId: variant._id,
      name: activeSale ? `[FLASH SALE] ${product.name}` : product.name,
      price: itemPrice, 
      quantity: item.quantity,
      image: imageToSave, // This now uses the actual selected image
      color: variant.color,
      size: variant.size,
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
    { $set: { items: [] } }
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
