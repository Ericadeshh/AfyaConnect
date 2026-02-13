import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { generateReferralNumber, validatePhysicianAccess } from "./utils";

interface ReferralResult {
  success: boolean;
  referralId?: string;
  referralNumber?: string;
  error?: string;
}

// Create a new referral
export const createReferral = mutation({
  args: {
    token: v.string(), // Auth token for validation
    physicianId: v.id("users"),

    // Patient Information
    patientName: v.string(),
    patientAge: v.number(),
    patientGender: v.string(),
    patientContact: v.string(),

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

    // Optional
    physicianNotes: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args): Promise<ReferralResult> => {
    // Validate physician access
    const isValid = await validatePhysicianAccess(
      ctx,
      args.physicianId,
      args.token,
    );
    if (!isValid) {
      throw new Error("Unauthorized: Invalid physician session");
    }

    // Get physician details
    const physician = await ctx.db.get(args.physicianId);
    if (!physician) {
      throw new Error("Physician not found");
    }

    const now = new Date().toISOString();
    const referralNumber = generateReferralNumber();

    // Create the referral
    const referralId = await ctx.db.insert("referrals", {
      // Patient Information
      patientName: args.patientName,
      patientAge: args.patientAge,
      patientGender: args.patientGender,
      patientContact: args.patientContact,

      // Referral Details
      referringPhysicianId: args.physicianId,
      referringPhysicianName: physician.name,
      referringHospital: physician.hospital || "Unknown Hospital",

      // Medical Information
      diagnosis: args.diagnosis,
      clinicalSummary: args.clinicalSummary,
      reasonForReferral: args.reasonForReferral,
      urgency: args.urgency,

      // Facility Information
      referredToFacility: args.referredToFacility,
      referredToDepartment: args.referredToDepartment,
      referredToPhysician: args.referredToPhysician,

      // Status
      status: "pending",

      // Timestamps
      createdAt: now,
      updatedAt: now,
      submittedAt: now,

      // Optional fields
      physicianNotes: args.physicianNotes,
      attachments: args.attachments,

      // Tracking
      referralNumber,
    });

    return {
      success: true,
      referralId,
      referralNumber,
    };
  },
});

// Update referral (for physicians - limited fields)
export const updateReferral = mutation({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
    referralId: v.id("referrals"),

    // Optional fields that can be updated
    patientName: v.optional(v.string()),
    patientAge: v.optional(v.number()),
    patientContact: v.optional(v.string()),
    diagnosis: v.optional(v.string()),
    clinicalSummary: v.optional(v.string()),
    reasonForReferral: v.optional(v.string()),
    urgency: v.optional(
      v.union(
        v.literal("routine"),
        v.literal("urgent"),
        v.literal("emergency"),
      ),
    ),
    referredToFacility: v.optional(v.string()),
    referredToDepartment: v.optional(v.string()),
    referredToPhysician: v.optional(v.string()),
    physicianNotes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ReferralResult> => {
    // Validate physician access
    const isValid = await validatePhysicianAccess(
      ctx,
      args.physicianId,
      args.token,
    );
    if (!isValid) {
      throw new Error("Unauthorized: Invalid physician session");
    }

    // Get the referral
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    // Verify this referral belongs to the physician
    if (referral.referringPhysicianId !== args.physicianId) {
      throw new Error(
        "Unauthorized: Cannot update another physician's referral",
      );
    }

    // Only allow updates if status is pending
    if (referral.status !== "pending") {
      throw new Error("Cannot update referral that is not in pending status");
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (args.patientName !== undefined) updates.patientName = args.patientName;
    if (args.patientAge !== undefined) updates.patientAge = args.patientAge;
    if (args.patientContact !== undefined)
      updates.patientContact = args.patientContact;
    if (args.diagnosis !== undefined) updates.diagnosis = args.diagnosis;
    if (args.clinicalSummary !== undefined)
      updates.clinicalSummary = args.clinicalSummary;
    if (args.reasonForReferral !== undefined)
      updates.reasonForReferral = args.reasonForReferral;
    if (args.urgency !== undefined) updates.urgency = args.urgency;
    if (args.referredToFacility !== undefined)
      updates.referredToFacility = args.referredToFacility;
    if (args.referredToDepartment !== undefined)
      updates.referredToDepartment = args.referredToDepartment;
    if (args.referredToPhysician !== undefined)
      updates.referredToPhysician = args.referredToPhysician;
    if (args.physicianNotes !== undefined)
      updates.physicianNotes = args.physicianNotes;

    await ctx.db.patch(args.referralId, updates);

    return {
      success: true,
      referralId: args.referralId,
    };
  },
});

// Cancel referral (physician can cancel their own pending referrals)
export const cancelReferral = mutation({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
    referralId: v.id("referrals"),
    cancellationReason: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ReferralResult> => {
    // Validate physician access
    const isValid = await validatePhysicianAccess(
      ctx,
      args.physicianId,
      args.token,
    );
    if (!isValid) {
      throw new Error("Unauthorized: Invalid physician session");
    }

    // Get the referral
    const referral = await ctx.db.get(args.referralId);
    if (!referral) {
      throw new Error("Referral not found");
    }

    // Verify this referral belongs to the physician
    if (referral.referringPhysicianId !== args.physicianId) {
      throw new Error(
        "Unauthorized: Cannot cancel another physician's referral",
      );
    }

    // Only allow cancellation if status is pending
    if (referral.status !== "pending") {
      throw new Error("Can only cancel pending referrals");
    }

    await ctx.db.patch(args.referralId, {
      status: "cancelled",
      updatedAt: new Date().toISOString(),
      physicianNotes: args.cancellationReason
        ? `${referral.physicianNotes || ""}\nCancelled: ${args.cancellationReason}`
        : referral.physicianNotes,
    });

    return {
      success: true,
      referralId: args.referralId,
    };
  },
});

// Approve referral (admin only) - NEW
export const approveReferral = mutation({
  args: {
    adminToken: v.string(),
    referralId: v.id("referrals"),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const admin = await ctx.db.get(session.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(args.referralId, {
      status: "approved",
      approvedAt: now,
      approvedBy: admin._id,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Log the action
    await ctx.db.insert("adminLogs", {
      adminId: admin._id,
      action: "APPROVE_REFERRAL",
      targetType: "referral",
      targetId: args.referralId,
      details: { notes: args.adminNotes },
      timestamp: now,
    });

    return { success: true };
  },
});

// Reject referral (admin only) - NEW
export const rejectReferral = mutation({
  args: {
    adminToken: v.string(),
    referralId: v.id("referrals"),
    rejectionReason: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const admin = await ctx.db.get(session.userId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }

    const now = new Date().toISOString();

    await ctx.db.patch(args.referralId, {
      status: "rejected",
      adminNotes: args.rejectionReason,
      updatedAt: now,
    });

    // Log the action
    await ctx.db.insert("adminLogs", {
      adminId: admin._id,
      action: "REJECT_REFERRAL",
      targetType: "referral",
      targetId: args.referralId,
      details: { reason: args.rejectionReason },
      timestamp: now,
    });

    return { success: true };
  },
});
