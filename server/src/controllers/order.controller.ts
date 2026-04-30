import { Request, Response } from "express";
import * as OrderService from "../services/order.service";

export const handleCreateOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { idempotencyKey } = req.body; 

    if (!idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "Idempotency key is required to prevent duplicate orders",
      });
    }
    const order = await OrderService.createOrder(
      userId,
      idempotencyKey
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const handleGetUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const orders = await OrderService.getUserOrders(userId);
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGetOrderDetails = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string;
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleDeleteOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string;
    
    await OrderService.deleteOrder(orderId);

    res.status(200).json({
      success: true,
      message: "Order deleted and stock restored successfully",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

