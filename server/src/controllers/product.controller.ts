import { Request, Response } from "express";
import * as ProductService from "../services/product.service";

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, category, variants, isActive } = req.body;
    const files = req.files as Express.Multer.File[];
    const imagePaths = files ? [...new Set(files.map((file) => file.filename))] : [];
    let formattedVariants = variants;
    if (typeof variants === "string") {
      try {
        formattedVariants = JSON.parse(variants);
      } catch (e) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid JSON format for variants",
          });
      }
    }
    const product = await ProductService.addProduct(
      name,
      description,
      category,
      imagePaths,
      formattedVariants,
      isActive === "false" ? false : true,
    );
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getAllProducts();
    res.status(201).json({ success: true, data: products });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id as string;
    const product = await ProductService.getProductById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, category, variants, isActive, existingImages } = req.body;
    const files = req.files as Express.Multer.File[];
    let finalImages: string[] = [];
    
    if (existingImages) {
      finalImages = typeof existingImages === "string" 
        ? JSON.parse(existingImages) 
        : existingImages;
    }
    if (files && files.length > 0) {
      const newPhotoNames = files.map((file) => file.filename);
      finalImages = [...finalImages, ...newPhotoNames];
    }

    const formattedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
    const activeStatus = isActive === "false" ? false : true;

    const updatedProduct = await ProductService.updateProduct(
      req.params.id as string,
      name,
      description,
      category,
      finalImages,
      formattedVariants,
      activeStatus
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error: any) {
    console.error("Update Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await ProductService.deleteProduct(
      req.params.id as string,
    );
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
