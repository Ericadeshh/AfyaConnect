import { v } from "convex/values";
import { query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Get AI summary count for a physician - FIXED: Remove physicianId filter
export const getPhysicianSummaryCount = query({
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

    // Since ai_summaries doesn't have physicianId, return total count for now
    // You can modify this later if you add physicianId to ai_summaries
    const summaries = await ctx.db.query("ai_summaries").collect();

    return summaries.length;
  },
});

// Get all AI summaries
export const getAllAISummaries = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const summaries = await ctx.db
      .query("ai_summaries")
      .order("desc")
      .collect();

    return summaries;
  },
});
