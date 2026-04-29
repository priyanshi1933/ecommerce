import { ProductModel } from "../models/product.model";

export const addProduct = async (
  name: string,
  description: string,
  category: string,
  image: string[],
  variants: { size: string; color: string; stock: number; price: number }[],
  isActive: boolean,
) => {
  return await ProductModel.create({
    name,
    description,
    category,
    image,
    variants,
    isActive,
  });
};

export const getAllProducts = async () => {
  return await ProductModel.find();
};

export const getProductById = async (id: string) => {
  return await ProductModel.findById(id);
};

export const updateProduct = async (
  id: string,
  name: string,
  description: string,
  category: string,
  image: string[],
  variants: any[],
  isActive: boolean,
) => {
  return await ProductModel.findByIdAndUpdate(
    id,
    {
      name,
      description,
      category,
      image,
      variants,
      isActive,
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

export const deleteProduct = async (id: string) => {
  return await ProductModel.findByIdAndDelete(id);
};
