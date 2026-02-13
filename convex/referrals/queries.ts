import { v } from "convex/values";
import { query } from "../_generated/server";
import { validatePhysicianAccess } from "./utils";
import { Doc } from "../_generated/dataModel";

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

    let query = ctx.db
      .query("referrals")
      .withIndex("by_referringPhysicianId", (q) =>
        q.eq("referringPhysicianId", args.physicianId),
      );

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    return await query.order("desc").collect();
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
