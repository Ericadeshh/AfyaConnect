import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

interface PhysicianProfileResult {
  success: boolean;
  profileId?: Id<"physicianProfiles">;
  error?: string;
}

// Create physician profile (for existing user)
export const createPhysicianProfile = mutation({
  args: {
    adminToken: v.string(),
    adminId: v.id("users"),

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
  },
  handler: async (ctx, args): Promise<PhysicianProfileResult> => {
    // Verify admin
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

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("physicianProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingProfile) {
      throw new Error("Physician profile already exists");
    }

    const now = new Date().toISOString();

    const profileId = await ctx.db.insert("physicianProfiles", {
      userId: args.userId,
      facilityId: args.facilityId,
      licenseNumber: args.licenseNumber,
      specialization: args.specialization,
      qualifications: args.qualifications,
      yearsOfExperience: args.yearsOfExperience,
      consultationFee: args.consultationFee,
      availability: args.availability,
      isActive: true,
      joinedAt: now,
      verifiedAt: now,
      verifiedBy: args.adminId,
    });

    // Update user record with physician details
    const facility = await ctx.db.get(args.facilityId);
    await ctx.db.patch(args.userId, {
      hospital: facility?.name,
      specialization: args.specialization,
      licenseNumber: args.licenseNumber,
    });

    await ctx.db.insert("adminLogs", {
      adminId: args.adminId,
      action: "CREATE_PHYSICIAN_PROFILE",
      targetType: "physician",
      targetId: profileId,
      details: { userId: args.userId, facilityId: args.facilityId },
      timestamp: now,
    });

    return { success: true, profileId };
  },
});

// Verify physician
export const verifyPhysician = mutation({
  args: {
    adminToken: v.string(),
    adminId: v.id("users"),
    physicianProfileId: v.id("physicianProfiles"),
    isVerified: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<PhysicianProfileResult> => {
    // Verify admin
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

    await ctx.db.patch(args.physicianProfileId, {
      isActive: args.isVerified,
      verifiedAt: args.isVerified ? now : undefined,
      verifiedBy: args.isVerified ? args.adminId : undefined,
    });

    await ctx.db.insert("adminLogs", {
      adminId: args.adminId,
      action: args.isVerified ? "VERIFY_PHYSICIAN" : "REJECT_PHYSICIAN",
      targetType: "physician",
      targetId: args.physicianProfileId,
      details: { notes: args.notes },
      timestamp: now,
    });

    return { success: true, profileId: args.physicianProfileId };
  },
});

// Assign physician to facility
export const assignPhysicianToFacility = mutation({
  args: {
    adminToken: v.string(),
    adminId: v.id("users"),
    physicianProfileId: v.id("physicianProfiles"),
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args): Promise<PhysicianProfileResult> => {
    // Verify admin
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

    const profile = await ctx.db.get(args.physicianProfileId);
    if (!profile) {
      throw new Error("Physician profile not found");
    }

    await ctx.db.patch(args.physicianProfileId, {
      facilityId: args.facilityId,
    });

    // Update user's hospital
    const facility = await ctx.db.get(args.facilityId);
    await ctx.db.patch(profile.userId, {
      hospital: facility?.name,
    });

    await ctx.db.insert("adminLogs", {
      adminId: args.adminId,
      action: "ASSIGN_PHYSICIAN",
      targetType: "physician",
      targetId: args.physicianProfileId,
      details: { facilityId: args.facilityId },
      timestamp: new Date().toISOString(),
    });

    return { success: true, profileId: args.physicianProfileId };
  },
});
