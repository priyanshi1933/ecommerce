import { Request, Response } from "express";
import * as CartService from "../services/cart.service";

export const handleAddToCart = async (req: Request, res: Response) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = (req as any).user.id;
    const updatedCart = await CartService.addToCart(
      userId,
      productId,
      variantId,
      Number(quantity),
    );
    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: updatedCart,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const cart = await CartService.getCartByUserId(userId);
    if (!cart) {
      return res.status(200).json({ success: true, data: { items: [] } });
    }
    res.status(200).json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleUpdateQuantity = async (req: Request, res: Response) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = (req as any).user.id;
    const updatedCart = await CartService.updateCartItemQuantity(
      userId,
      productId,
      variantId,
      quantity,
    );
    res.status(200).json({
      success: true,
      data: updatedCart,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleRemoveFromCart = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const variantId = req.params.variantId as string;
    const userId = (req as any).user._id || (req as any).user.id;

    const updatedCart = await CartService.removeFromCart(
      userId,
      productId,
      variantId
    );

    res.status(200).json({ success: true, data: updatedCart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

