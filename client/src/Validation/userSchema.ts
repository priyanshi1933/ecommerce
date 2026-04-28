import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(3, "Name contain minimum of 3 characters")
    .max(10, "Name contain maximum of 10 characters"),
  email: z.string().email("Please enter valid email format"),
  password: z.string().min(6, "Password contain minimum of 6 characters"),
  role: z.string().min(1, "Please select a role"), 
});;
