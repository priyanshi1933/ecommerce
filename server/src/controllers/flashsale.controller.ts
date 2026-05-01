import { Request, Response } from "express";
import * as FlashService from "../services/flashsale.service";

export const handlePreJoin = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { flashSaleId } = req.body;
    const data = await FlashService.registerUserForSale(flashSaleId, userId);
    res.status(200).json({ success: true, message: "Joined successfully", data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const handleBuyFlashItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    
    const { flashSaleId, paymentStatus } = req.body; 

    const data = await FlashService.executeFlashPurchase(
      flashSaleId, 
      userId, 
      paymentStatus || "Pending"
    );

    res.status(200).json({ 
      success: true, 
      message: "Flash order confirmed!", 
      data 
    });
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
  }
};

export const handleCreateFlashSale = async (req: Request, res: Response) => {
  try {
    const { productId, variantId, salePrice, maxUnits, startTime, endTime } = req.body;

    const flashSale = await FlashService.createFlashSale({
      productId,
      variantId,
      salePrice: Number(salePrice),
      maxUnits: Number(maxUnits),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    res.status(201).json({
      success: true,
      message: "Flash Sale created successfully",
      data: flashSale,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetActiveFlashSales = async (req: Request, res: Response) => {
  try {
    const sales = await FlashService.getActiveFlashSales();
    res.status(200).json({
      success: true,
      data: sales,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

