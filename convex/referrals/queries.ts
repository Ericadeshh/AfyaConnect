import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { validatePhysicianAccess } from "./utils";

// Define the status type to match the schema
type ReferralStatus =
  | "pending"
  | "approved"
  | "forwarded"
  | "completed"
  | "rejected"
  | "cancelled";

// Get all referrals for a physician
export const getPhysicianReferrals = query({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("forwarded"),
        v.literal("completed"),
        v.literal("rejected"),
        v.literal("cancelled"),
      ),
    ),
  },
  handler: async (ctx, args): Promise<Doc<"referrals">[]> => {
    // Validate physician access
    const isValid = await validatePhysicianAccess(
      ctx,
      args.physicianId,
      args.token,
    );
    if (!isValid) {
      throw new Error("Unauthorized: Invalid physician session");
    }

    // Build query without reassigning
    let referrals: Doc<"referrals">[];

    if (args.status) {
      referrals = await ctx.db
        .query("referrals")
        .withIndex("by_referringPhysicianId_and_status", (q) =>
          q
            .eq("referringPhysicianId", args.physicianId)
            .eq("status", args.status as ReferralStatus),
        )
        .order("desc")
        .collect();
    } else {
      referrals = await ctx.db
        .query("referrals")
        .withIndex("by_referringPhysicianId", (q) =>
          q.eq("referringPhysicianId", args.physicianId),
        )
        .order("desc")
        .collect();
    }

    return referrals;
  },
});

// Get pending referrals for a physician
export const getPendingReferrals = query({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
  },
  handler: async (ctx, args): Promise<Doc<"referrals">[]> => {
    const isValid = await validatePhysicianAccess(
      ctx,
      args.physicianId,
      args.token,
    );
    if (!isValid) {
      throw new Error("Unauthorized: Invalid physician session");
    }

    return await ctx.db
      .query("referrals")
      .withIndex("by_referringPhysicianId_and_status", (q) =>
        q.eq("referringPhysicianId", args.physicianId).eq("status", "pending"),
      )
      .order("desc")
      .collect();
  },
});

// Get completed referrals for a physician
export const getCompletedReferrals = query({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
  },
  handler: async (ctx, args): Promise<Doc<"referrals">[]> => {
    const isValid = await validatePhysicianAccess(
      ctx,
      args.physicianId,
      args.token,
    );
    if (!isValid) {
      throw new Error("Unauthorized: Invalid physician session");
    }

    return await ctx.db
      .query("referrals")
      .withIndex("by_referringPhysicianId_and_status", (q) =>
        q
          .eq("referringPhysicianId", args.physicianId)
          .eq("status", "completed"),
      )
      .order("desc")
      .collect();
  },
});

// Get single referral by ID
export const getReferralById = query({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
    referralId: v.id("referrals"),
  },
  handler: async (ctx, args): Promise<Doc<"referrals"> | null> => {
    const isValid = await validatePhysicianAccess(
      ctx,
      args.physicianId,
      args.token,
    );
    if (!isValid) {
      throw new Error("Unauthorized: Invalid physician session");
    }

    const referral = await ctx.db.get(args.referralId);

    // Verify this referral belongs to the physician
    if (!referral || referral.referringPhysicianId !== args.physicianId) {
      return null;
    }

    return referral;
  },
});

// Get referral statistics for physician dashboard
export const getReferralStats = query({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    total: number;
    pending: number;
    approved: number;
    completed: number;
    rejected: number;
    cancelled: number;
  }> => {
    const isValid = await validatePhysicianAccess(
      ctx,
      args.physicianId,
      args.token,
    );
    if (!isValid) {
      throw new Error("Unauthorized: Invalid physician session");
    }

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referringPhysicianId", (q) =>
        q.eq("referringPhysicianId", args.physicianId),
      )
      .collect();

    const stats = {
      total: referrals.length,
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
    };

    referrals.forEach((ref) => {
      switch (ref.status) {
        case "pending":
          stats.pending++;
          break;
        case "approved":
          stats.approved++;
          break;
        case "completed":
          stats.completed++;
          break;
        case "rejected":
          stats.rejected++;
          break;
        case "cancelled":
          stats.cancelled++;
          break;
      }
    });

    return stats;
  },
});

// Get all referrals (for admin)
export const getAllReferralsAdmin = query({
  args: {
    adminToken: v.string(),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("forwarded"),
        v.literal("completed"),
        v.literal("rejected"),
        v.literal("cancelled"),
      ),
    ),
  },
  handler: async (ctx, args): Promise<Doc<"referrals">[]> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(session.userId);
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    let referrals: Doc<"referrals">[];

    if (args.status) {
      referrals = await ctx.db
        .query("referrals")
        .withIndex("by_status", (q) =>
          q.eq("status", args.status as ReferralStatus),
        )
        .order("desc")
        .collect();
    } else {
      referrals = await ctx.db.query("referrals").order("desc").collect();
    }

    return referrals;
  },
});

// Get completed referrals for admin
export const getCompletedReferralsAdmin = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"referrals">[]> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(session.userId);
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    return await ctx.db
      .query("referrals")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .order("desc")
      .collect();
  },
});

// Get all referrals (for calendar view)
export const getAllReferrals = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"referrals">[]> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If physician, only return their referrals
    if (user.role === "physician") {
      return await ctx.db
        .query("referrals")
        .withIndex("by_referringPhysicianId", (q) =>
          q.eq("referringPhysicianId", user._id),
        )
        .order("desc")
        .collect();
    }

    // If admin, return all referrals
    if (user.role === "admin") {
      return await ctx.db.query("referrals").order("desc").collect();
    }

    throw new Error("Unauthorized access");
  },
});

// ============= ADMIN SPECIFIC QUERIES =============

// Get pending referrals for admin (WITH physician data)
export const getPendingReferralsAdmin = query({
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

    const user = await ctx.db.get(session.userId);
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
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
          referringPhysicianName: physician?.name,
          referringHospital: physician?.hospital,
        };
      }),
    );
  },
});

// Get pending referrals count for admin (SINGLE INSTANCE - KEEP THIS ONE)
export const getPendingReferralsCount = query({
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

    const user = await ctx.db.get(session.userId);
    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const pendingReferrals = await ctx.db
      .query("referrals")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return pendingReferrals.length;
  },
});

// Get pending count for a specific physician
export const getPhysicianPendingCount = query({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
  },
  handler: async (ctx, args): Promise<number> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.userId !== args.physicianId) {
      throw new Error("Unauthorized");
    }

    const pending = await ctx.db
      .query("referrals")
      .withIndex("by_referringPhysicianId_and_status", (q) =>
        q.eq("referringPhysicianId", args.physicianId).eq("status", "pending"),
      )
      .collect();

    return pending.length;
  },
});

// Get completed count for a specific physician
export const getPhysicianCompletedCount = query({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
  },
  handler: async (ctx, args): Promise<number> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.userId !== args.physicianId) {
      throw new Error("Unauthorized");
    }

    const completed = await ctx.db
      .query("referrals")
      .withIndex("by_referringPhysicianId_and_status", (q) =>
        q
          .eq("referringPhysicianId", args.physicianId)
          .eq("status", "completed"),
      )
      .collect();

    return completed.length;
  },
});
