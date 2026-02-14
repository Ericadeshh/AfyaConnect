import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// Get all facilities
export const getAllFacilities = query({
  args: {
    adminToken: v.string(),
    status: v.optional(
      v.union(v.literal("active"), v.literal("inactive"), v.literal("pending")),
    ),
    city: v.optional(v.string()),
    county: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Doc<"facilities">[]> => {
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

    let facilities: Doc<"facilities">[];

    if (args.status) {
      facilities = await ctx.db
        .query("facilities")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      facilities = await ctx.db.query("facilities").collect();
    }

    // Apply filters manually if needed
    if (args.city) {
      facilities = facilities.filter((f) => f.city === args.city);
    }
    if (args.county) {
      facilities = facilities.filter((f) => f.county === args.county);
    }

    return facilities;
  },
});

// Get facility by ID
export const getFacilityById = query({
  args: {
    adminToken: v.string(),
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args): Promise<Doc<"facilities"> | null> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!session) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.get(args.facilityId);
  },
});

// Get all physicians with profiles
export const getAllPhysicians = query({
  args: {
    adminToken: v.string(),
    facilityId: v.optional(v.id("facilities")),
    specialization: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any[]> => {
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

    let profiles: Doc<"physicianProfiles">[] = await ctx.db
      .query("physicianProfiles")
      .collect();

    // Apply filters
    if (args.facilityId) {
      profiles = profiles.filter((p) => p.facilityId === args.facilityId);
    }
    if (args.specialization) {
      profiles = profiles.filter(
        (p) => p.specialization === args.specialization,
      );
    }
    if (args.isActive !== undefined) {
      profiles = profiles.filter((p) => p.isActive === args.isActive);
    }

    // Enrich with user and facility data
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        const facility = await ctx.db.get(profile.facilityId);
        return {
          ...profile,
          user: {
            name: user?.name,
            email: user?.email,
            phoneNumber: user?.phoneNumber,
          },
          facilityName: facility?.name,
          facilityCity: facility?.city,
        };
      }),
    );

    return enrichedProfiles;
  },
});

// Get dashboard stats - FIXED VERSION
export const getDashboardStats = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
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

    const now = new Date();
    const firstDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    // Get all referrals
    const referrals = await ctx.db.query("referrals").collect();

    // Calculate this month's referrals
    const thisMonthReferrals = referrals.filter(
      (r) => r.createdAt >= firstDayOfMonth,
    );

    // Calculate counts by status - FIXED: Use proper status values
    const pendingApproval = referrals.filter(
      (r) => r.status === "pending",
    ).length;
    const completed = referrals.filter((r) => r.status === "completed").length;
    const approved = referrals.filter((r) => r.status === "approved").length;
    const rejected = referrals.filter((r) => r.status === "rejected").length;
    const cancelled = referrals.filter((r) => r.status === "cancelled").length;

    // Calculate total referrals
    const totalReferrals = referrals.length;

    // Calculate completion rate (completed vs total)
    const completionRate =
      totalReferrals > 0
        ? ((completed / totalReferrals) * 100).toFixed(1)
        : "0.0";

    // Get facility stats
    const facilities = await ctx.db.query("facilities").collect();
    const activeFacilities = facilities.filter(
      (f) => f.status === "active",
    ).length;
    const pendingFacilities = facilities.filter(
      (f) => f.status === "pending",
    ).length;
    const inactiveFacilities = facilities.filter(
      (f) => f.status === "inactive",
    ).length;

    // Get physician stats
    const physicianProfiles = await ctx.db.query("physicianProfiles").collect();
    const activePhysicians = physicianProfiles.filter((p) => p.isActive).length;
    const pendingVerification = physicianProfiles.filter(
      (p) => !p.verifiedAt,
    ).length;
    const inactivePhysicians = physicianProfiles.filter(
      (p) => !p.isActive && p.verifiedAt,
    ).length;

    // Get users with physician role
    const physicianUsers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "physician"))
      .collect();

    return {
      referrals: {
        total: totalReferrals,
        thisMonth: thisMonthReferrals.length,
        pendingApproval,
        completed,
        approved,
        rejected,
        cancelled,
        completionRate,
      },
      facilities: {
        total: facilities.length,
        active: activeFacilities,
        pending: pendingFacilities,
        inactive: inactiveFacilities,
      },
      physicians: {
        total: physicianProfiles.length,
        active: activePhysicians,
        pendingVerification,
        inactive: inactivePhysicians,
        userCount: physicianUsers.length,
      },
    };
  },
});

// Get pending facilities count
export const getPendingFacilitiesCount = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args): Promise<number> => {
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

    const facilities = await ctx.db
      .query("facilities")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return facilities.length;
  },
});

// Get pending physicians count
export const getPendingPhysiciansCount = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args): Promise<number> => {
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

    const physicians = await ctx.db
      .query("physicianProfiles")
      .filter((q) => q.eq(q.field("verifiedAt"), undefined))
      .collect();

    return physicians.length;
  },
});

// Get pending referrals for admin approval
export const getPendingReferrals = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const pendingReferrals = await ctx.db
      .query("referrals")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    // Enrich with physician data
    return await Promise.all(
      pendingReferrals.map(async (referral) => {
        const physician = await ctx.db.get(referral.referringPhysicianId);
        return {
          ...referral,
          physicianName: physician?.name,
          physicianHospital: physician?.hospital,
        };
      }),
    );
  },
});
