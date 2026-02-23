import type { User } from "../models/User"

export interface UserRepository {
  findById(userId: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByStripeCustomerId(customerId: string): Promise<User | null>

  save(user: User): Promise<void>
  create(user: User): Promise<void> // Atomic creation — fails if email already exists

  updateFields(userId: string, fields: Partial<Pick<User, "name" | "email" | "passwordHash" | "plan" | "stripeCustomerId" | "stripeSubscriptionId" | "planExpiresAt">>): Promise<void>
  updateEmail(userId: string, oldEmail: string, newEmail: string): Promise<void>
  updatePlan(userId: string, plan: "free" | "pro", stripeCustomerId?: string, stripeSubscriptionId?: string, planExpiresAt?: string): Promise<void>

  // Login attempt tracking
  getLoginAttempts(email: string): Promise<number>
  incrementLoginAttempts(email: string): Promise<number>
  resetLoginAttempts(email: string): Promise<void>

  // Webhook idempotency
  isEventProcessed(eventId: string): Promise<boolean>
  markEventProcessed(eventId: string): Promise<void>
}
