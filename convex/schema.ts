import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ai_summaries: defineTable({
    physicianId: v.optional(v.id("users")),
    inputType: v.string(),
    inputPreview: v.string(),
    summary: v.string(),
    confidence: v.number(),
    modelUsed: v.string(),
    createdAt: v.string(),
    processingTimeMs: v.optional(v.number()),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_physicianId", ["physicianId"]),

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

  // Facilities table
  facilities: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("hospital"),
      v.literal("clinic"),
      v.literal("health_center"),
      v.literal("specialized_clinic"),
    ),
    registrationNumber: v.string(),
    address: v.string(),
    city: v.string(),
    county: v.string(),
    phone: v.string(),
    email: v.string(),
    website: v.optional(v.string()),
    services: v.array(v.string()),
    departments: v.array(v.string()),
    bedCapacity: v.optional(v.number()),
    emergencyServices: v.boolean(),
    operatingHours: v.string(),
    accreditation: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("pending"),
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.id("users"),
  })
    .index("by_name", ["name"])
    .index("by_city", ["city"])
    .index("by_county", ["county"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Physician Profiles (linked to users)
  physicianProfiles: defineTable({
    userId: v.id("users"),
    facilityId: v.id("facilities"),
    licenseNumber: v.string(),
    specialization: v.string(),
    qualifications: v.array(v.string()),
    yearsOfExperience: v.number(),
    consultationFee: v.optional(v.number()),
    availability: v.array(
      v.object({
        day: v.string(),
        startTime: v.string(),
        endTime: v.string(),
      }),
    ),
    isActive: v.boolean(),
    joinedAt: v.string(),
    verifiedAt: v.optional(v.string()),
    verifiedBy: v.optional(v.id("users")),
  })
    .index("by_userId", ["userId"])
    .index("by_facilityId", ["facilityId"])
    .index("by_specialization", ["specialization"])
    .index("by_isActive", ["isActive"]),

  // Facility Departments
  departments: defineTable({
    facilityId: v.id("facilities"),
    name: v.string(),
    headOfDepartment: v.optional(v.id("users")),
    services: v.array(v.string()),
    contactExtension: v.optional(v.string()),
    email: v.optional(v.string()),
    capacity: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_facilityId", ["facilityId"])
    .index("by_name", ["name"]),

  // Admin Actions Log
  adminLogs: defineTable({
    adminId: v.id("users"),
    action: v.string(),
    targetType: v.union(
      v.literal("facility"),
      v.literal("physician"),
      v.literal("referral"),
      v.literal("user"),
    ),
    targetId: v.union(
      v.id("facilities"),
      v.id("physicianProfiles"),
      v.id("referrals"),
      v.id("users"),
    ),
    details: v.any(),
    timestamp: v.string(),
  })
    .index("by_adminId", ["adminId"])
    .index("by_targetType", ["targetType"])
    .index("by_timestamp", ["timestamp"]),

  // ============= RECEIVING FACILITY TABLES =============

  // Clinic Schedule
  clinicSchedule: defineTable({
    facilityId: v.id("facilities"),
    date: v.string(),
    isOpen: v.boolean(),
    maxPatients: v.number(),
    currentBookings: v.number(),
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_facilityId", ["facilityId"])
    .index("by_facilityId_and_date", ["facilityId", "date"])
    .index("by_date", ["date"]),

  // Patient Outcomes
  patientOutcomes: defineTable({
    referralId: v.id("referrals"),
    facilityId: v.id("facilities"),
    physicianId: v.id("users"),
    finalDiagnosis: v.string(),
    treatmentGiven: v.optional(v.string()),
    requiresFurtherReferral: v.boolean(),
    furtherReferralFacility: v.optional(v.string()),
    furtherReferralReason: v.optional(v.string()),
    furtherReferralCreated: v.optional(v.boolean()),
    newReferralId: v.optional(v.id("referrals")),
    notes: v.optional(v.string()),
    outcomeDate: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_referralId", ["referralId"])
    .index("by_facilityId", ["facilityId"])
    .index("by_physicianId", ["physicianId"])
    .index("by_outcomeDate", ["outcomeDate"]),

  // Facility Events
  facilityEvents: defineTable({
    facilityId: v.id("facilities"),
    title: v.string(),
    description: v.optional(v.string()),
    eventType: v.union(
      v.literal("meeting"),
      v.literal("holiday"),
      v.literal("training"),
      v.literal("maintenance"),
      v.literal("other"),
    ),
    startDate: v.string(),
    endDate: v.string(),
    isAllDay: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_facilityId", ["facilityId"])
    .index("by_facilityId_and_date", ["facilityId", "startDate"])
    .index("by_date_range", ["startDate", "endDate"]),

  // ============= SIMPLIFIED PAYMENT TABLE (Based on working app) =============
  payments: defineTable({
    amount: v.number(),
    phoneNumber: v.string(),
    transactionId: v.optional(v.string()),
    checkoutRequestId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    // Enhanced payment tracking fields
    referralId: v.optional(v.id("referrals")),
    userId: v.optional(v.id("users")),
    failureReason: v.optional(v.string()),
    mpesaReceiptNumber: v.optional(v.string()),
    transactionDate: v.optional(v.number()),
    // Metadata for additional context
    metadata: v.optional(v.any()),
  })
    .index("by_phone", ["phoneNumber"])
    .index("by_status", ["status"])
    .index("by_checkoutRequestId", ["checkoutRequestId"])
    .index("by_referralId", ["referralId"])
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_referralId_and_status", ["referralId", "status"])
    .index("by_mpesaReceiptNumber", ["mpesaReceiptNumber"]),

  // Facility Subscriptions (keep if needed)
  facilitySubscriptions: defineTable({
    facilityId: v.id("facilities"),
    planId: v.string(),
    planName: v.string(),
    amount: v.number(),
    billingCycle: v.union(
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("annually"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("expired"),
      v.literal("cancelled"),
      v.literal("suspended"),
    ),
    startDate: v.string(),
    endDate: v.string(),
    nextBillingDate: v.string(),
    autoRenew: v.boolean(),
    paymentPhoneNumber: v.string(),
    features: v.array(v.string()),
    maxReferrals: v.number(),
    maxUsers: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_facilityId", ["facilityId"])
    .index("by_status", ["status"])
    .index("by_nextBillingDate", ["nextBillingDate"]),

  // Patient Wallets (keep if needed)
  patientWallets: defineTable({
    userId: v.id("users"),
    balance: v.number(),
    currency: v.string(),
    autoTopUp: v.boolean(),
    autoTopUpThreshold: v.optional(v.number()),
    autoTopUpAmount: v.optional(v.number()),
    defaultPhoneNumber: v.optional(v.string()),
    lastTransactionId: v.optional(v.id("payments")),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_userId", ["userId"]),

  // Invoices (keep if needed)
  invoices: defineTable({
    invoiceNumber: v.string(),
    userId: v.optional(v.id("users")),
    facilityId: v.optional(v.id("facilities")),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        total: v.number(),
      }),
    ),
    subtotal: v.number(),
    tax: v.optional(v.number()),
    total: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled"),
    ),
    dueDate: v.string(),
    paidDate: v.optional(v.string()),
    paymentId: v.optional(v.id("payments")),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_invoiceNumber", ["invoiceNumber"])
    .index("by_userId", ["userId"])
    .index("by_facilityId", ["facilityId"])
    .index("by_status", ["status"]),
});
