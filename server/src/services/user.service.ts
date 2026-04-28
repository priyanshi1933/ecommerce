import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";

export const register = async (
  name: string,
  email: string,
  password: string,
  role: string,
) => {
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exist");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  return await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role,
  });
};

export const login = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  return await UserModel.findOne({ email });
};

export const getUser = async () => {
  const users = await UserModel.find();
  return users;
};
