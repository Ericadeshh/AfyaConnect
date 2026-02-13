import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Your existing ai_summaries table
  ai_summaries: defineTable({
    inputType: v.string(),
    inputPreview: v.string(),
    summary: v.string(),
    confidence: v.number(),
    modelUsed: v.string(),
    createdAt: v.string(),
    processingTimeMs: v.optional(v.number()),
  }).index("by_createdAt", ["createdAt"]),

  // Users table for authentication
  users: defineTable({
    email: v.string(),
    password: v.string(), // This will be hashed
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("physician"),
      v.literal("patient"),
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
    lastLogin: v.optional(v.string()),
    isActive: v.boolean(),
    profileImage: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    // Physician fields
    hospital: v.optional(v.string()),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    // Patient fields
    dateOfBirth: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_email_and_role", ["email", "role"]),

  // Sessions table for managing user sessions
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.string(),
    createdAt: v.string(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"])
    .index("by_expiresAt", ["expiresAt"]),
});
