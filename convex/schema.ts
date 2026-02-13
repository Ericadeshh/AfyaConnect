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
    password: v.string(),
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

  // Referrals table
  referrals: defineTable({
    // Patient Information
    patientName: v.string(),
    patientAge: v.number(),
    patientGender: v.string(),
    patientContact: v.string(),

    // Referral Details
    referringPhysicianId: v.id("users"),
    referringPhysicianName: v.string(),
    referringHospital: v.string(),

    // Medical Information
    diagnosis: v.string(),
    clinicalSummary: v.string(),
    reasonForReferral: v.string(),
    urgency: v.union(
      v.literal("routine"),
      v.literal("urgent"),
      v.literal("emergency"),
    ),

    // Facility Information
    referredToFacility: v.string(),
    referredToDepartment: v.optional(v.string()),
    referredToPhysician: v.optional(v.string()),

    // Status Tracking
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("forwarded"),
      v.literal("completed"),
      v.literal("rejected"),
      v.literal("cancelled"),
    ),

    // Timestamps
    createdAt: v.string(),
    updatedAt: v.string(),
    submittedAt: v.string(),
    approvedAt: v.optional(v.string()),
    forwardedAt: v.optional(v.string()),
    completedAt: v.optional(v.string()),

    // Admin Actions
    approvedBy: v.optional(v.id("users")),
    adminNotes: v.optional(v.string()),

    // Documents/Attachments (optional)
    attachments: v.optional(v.array(v.string())),

    // Additional Notes
    physicianNotes: v.optional(v.string()),

    // Tracking
    referralNumber: v.string(),
  })
    .index("by_referringPhysicianId", ["referringPhysicianId"])
    .index("by_status", ["status"])
    .index("by_urgency", ["urgency"])
    .index("by_createdAt", ["createdAt"])
    .index("by_referringPhysicianId_and_status", [
      "referringPhysicianId",
      "status",
    ])
    .index("by_referralNumber", ["referralNumber"]),
});
