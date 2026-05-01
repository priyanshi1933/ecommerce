import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  joinedFlashSales: mongoose.Types.ObjectId[];
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    joinedFlashSales: [{ type: Schema.Types.ObjectId, ref: "Flashsale" }],
  },
  {
    timestamps: true,
  },
);
export const UserModel = mongoose.model<IUser>("User", UserSchema);
