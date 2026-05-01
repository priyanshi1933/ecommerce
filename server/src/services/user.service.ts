import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";

export const register = async (
  name: string,
  email: string,
  password: string,
  role: string,
) => {
  const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("Email already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  return await UserModel.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
  });
};

export const login = async (email: string) => {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const getUser = async () => {
  return await UserModel.find().select("-password");
};

export const getUserProfile = async (userId: string) => {
  return await UserModel.findById(userId)
    .select("-password")
    .populate("joinedFlashSales"); 
};

