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

    let profiles: Doc<"physicianProfiles">[];

    // Build query based on filters
    if (args.facilityId && args.specialization && args.isActive !== undefined) {
      // Multiple filters - need to collect all and filter manually
      profiles = await ctx.db.query("physicianProfiles").collect();
      profiles = profiles.filter(
        (p) =>
          p.facilityId === args.facilityId &&
          p.specialization === args.specialization &&
          p.isActive === args.isActive,
      );
    } else if (args.facilityId) {
      profiles = await ctx.db
        .query("physicianProfiles")
        .withIndex("by_facilityId", (q) => q.eq("facilityId", args.facilityId!))
        .collect();
    } else if (args.specialization) {
      profiles = await ctx.db
        .query("physicianProfiles")
        .withIndex("by_specialization", (q) =>
          q.eq("specialization", args.specialization!),
        )
        .collect();
    } else if (args.isActive !== undefined) {
      profiles = await ctx.db
        .query("physicianProfiles")
        .withIndex("by_isActive", (q) => q.eq("isActive", args.isActive!))
        .collect();
    } else {
      profiles = await ctx.db.query("physicianProfiles").collect();
    }

    // Enrich with user and facility data
    return await Promise.all(
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
        };
      }),
    );
  },
});

// Get dashboard stats
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

    // Filter this month's referrals
    const thisMonthReferrals = referrals.filter(
      (r) => r.createdAt >= firstDayOfMonth,
    );

    // Get counts by status
    const pendingApproval = referrals.filter(
      (r) => r.status === "pending",
    ).length;
    const completed = referrals.filter((r) => r.status === "completed").length;
    const approved = referrals.filter((r) => r.status === "approved").length;
    const cancelled = referrals.filter((r) => r.status === "cancelled").length;

    // Get facility stats
    const facilities = await ctx.db.query("facilities").collect();
    const activeFacilities = facilities.filter(
      (f) => f.status === "active",
    ).length;
    const pendingFacilities = facilities.filter(
      (f) => f.status === "pending",
    ).length;

    // Get physician stats
    const physicians = await ctx.db.query("physicianProfiles").collect();
    const activePhysicians = physicians.filter((p) => p.isActive).length;
    const pendingVerification = physicians.filter((p) => !p.verifiedAt).length;

    return {
      referrals: {
        total: referrals.length,
        thisMonth: thisMonthReferrals.length,
        pendingApproval,
        completed,
        approved,
        cancelled,
        completionRate: referrals.length
          ? ((completed / referrals.length) * 100).toFixed(1)
          : 0,
      },
      facilities: {
        total: facilities.length,
        active: activeFacilities,
        pending: pendingFacilities,
      },
      physicians: {
        total: physicians.length,
        active: activePhysicians,
        pendingVerification,
      },
    };
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

    // Enrich with physician and patient data
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
