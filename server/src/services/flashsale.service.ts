import { FlashsaleModel } from "../models/flashsale.model";
import { UserModel } from "../models/user.model";
import { OrderModel } from "../models/order.model";
import { Types } from "mongoose";

export const registerUserForSale = async (
  flashSaleId: string,
  userId: string,
) => {
  const sale = await FlashsaleModel.findById(flashSaleId);
  if (!sale) throw new Error("Sale not found");
  if (new Date() >= sale.startTime) throw new Error("Sale already started");

  await UserModel.findByIdAndUpdate(userId, {
    $addToSet: { joinedFlashSales: flashSaleId },
  });
  return await FlashsaleModel.findByIdAndUpdate(
    flashSaleId,
    { $addToSet: { participants: userId } },
    { new: true },
  );
};

export const executeFlashPurchase = async (
  flashSaleId: string,
  userId: string,
  paymentStatus: string,
) => {
  const now = new Date();

  const sale = await FlashsaleModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(flashSaleId),
      startTime: { $lte: now },
      endTime: { $gte: now },
      $expr: { $lt: ["$soldUnits", "$maxUnits"] },
    },
    { $inc: { soldUnits: 1 } },
    { new: true },
  ).populate("productId");

  if (!sale) throw new Error("Sale locked, ended, or sold out.");

  const product = sale.productId as any;

  const variantIndex = product.variants.findIndex(
    (v: any) => v._id.toString() === sale.variantId.toString(),
  );

  const variant = product.variants[variantIndex];
  const selectedImage = product.image[variantIndex] || product.image[0];

  const newOrder = await OrderModel.create({
    userId: new Types.ObjectId(userId),
    items: [
      {
        productId: product._id,
        variantId: sale.variantId,
        name: `[FLASH SALE] ${product.name}`,
        price: sale.salePrice,
        quantity: 1,
        image: selectedImage,
        color: variant?.color || "N/A",
        size: variant?.size || "N/A",
      },
    ],
    totalAmount: sale.salePrice,
    idempotencyKey: `flash-${flashSaleId}-${userId}-${Date.now()}`,
    paymentStatus: paymentStatus,
    status: "Placed",
    statusTimeline: [{ status: "Placed", updatedAt: new Date() }],
  });

  return newOrder;
};

export const createFlashSale = async (data: {
  productId: string;
  variantId: string;
  salePrice: number;
  maxUnits: number;
  startTime: Date;
  endTime: Date;
}) => {
  return await FlashsaleModel.create({
    ...data,
    productId: new Types.ObjectId(data.productId),
    variantId: new Types.ObjectId(data.variantId),
  });
};

export const getActiveFlashSales = async () => {
  const now = new Date();
  return await FlashsaleModel.find({
    isActive: true,
    endTime: { $gte: now },
  })
    .populate("productId")
    .sort({ startTime: 1 });
};
