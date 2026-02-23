import { z } from "zod"

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  passwordHash: z.string().min(1),
  createdAt: z.string().datetime(),
  plan: z.enum(["free", "pro"]).default("free"),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  planExpiresAt: z.string().datetime().optional(),
})

export type User = z.infer<typeof UserSchema>

export const CreateUserInput = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9\s\u3000-\u9FFF\uF900-\uFAFF\u{20000}-\u{2FA1F}]+$/u),
  email: z.string().email().max(254).transform((v) => v.toLowerCase()),
  password: z.string().min(8),
})

export type CreateUserInputType = z.infer<typeof CreateUserInput>

export const UpdateProfileInput = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9\s\u3000-\u9FFF\uF900-\uFAFF\u{20000}-\u{2FA1F}]+$/u)
    .optional(),
  newEmail: z.string().email().max(254).transform((v) => v.toLowerCase()).optional(),
}).strict()

export type UpdateProfileInputType = z.infer<typeof UpdateProfileInput>
