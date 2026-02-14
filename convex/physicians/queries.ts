import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// Get physician dashboard stats
export const getPhysicianDashboardStats = query({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
  },
  handler: async (ctx, args): Promise<any> => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.userId !== args.physicianId) {
      throw new Error("Unauthorized");
    }

    const physician = await ctx.db.get(args.physicianId);
    if (!physician || physician.role !== "physician") {
      throw new Error("Physician access required");
    }

    // Get all referrals for this physician
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referringPhysicianId", (q) =>
        q.eq("referringPhysicianId", args.physicianId),
      )
      .collect();

    // Get AI summaries count - FIXED: Remove physicianId filter since it doesn't exist
    const aiSummaries = await ctx.db.query("ai_summaries").collect();

    // Calculate stats
    const totalReferrals = referrals.length;
    const pendingReferrals = referrals.filter(
      (r) => r.status === "pending",
    ).length;
    const completedReferrals = referrals.filter(
      (r) => r.status === "completed",
    ).length;
    const approvedReferrals = referrals.filter(
      (r) => r.status === "approved",
    ).length;
    const aiSummaryCount = aiSummaries.length; // Total AI summaries in the system

    // Get recent activity - FIXED: Remove AI summaries from activity
    const recentActivity = referrals.slice(0, 5).map((r) => ({
      type: "referral",
      title: `Referral #${r.referralNumber}`,
      patientName: r.patientName,
      time: new Date(r.createdAt).toLocaleDateString(),
      status: r.status,
      statusColor:
        r.status === "pending"
          ? "yellow"
          : r.status === "completed"
            ? "green"
            : "blue",
      color: "blue",
    }));

    return {
      totalReferrals,
      pendingReferrals,
      completedReferrals,
      approvedReferrals,
      aiSummaryCount,
      recentActivity,
    };
  },
});
