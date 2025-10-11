import { z } from "zod"

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .trim(),
  email: z
    .string()
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});
