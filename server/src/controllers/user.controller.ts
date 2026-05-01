import { Request, Response } from "express";
import { getUser, getUserProfile, login, register } from "../services/user.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
console.log("Secret loaded:", process.env.JWT_SECRET);

const secret = process.env.JWT_SECRET as string;

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await register(name, email, password, role);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await login(email);
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ field: "password", message: "Password does not match" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, secret || 'fallback_secret', {
      expiresIn: "1h",
    });

    res.cookie("token", token);
    res.json({
      token,
      role: user.role,
      id: user._id,
      name: user.name,
      joinedFlashSales: user.joinedFlashSales 
    });
  } catch (error: any) {
    res.status(400).json({ field: "email", message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; 
    const user = await getUserProfile(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getUser();
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ message: "No User Available" });
  }
};