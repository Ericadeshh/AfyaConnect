import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PhysicianPaymentStats {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  completedAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  failedPayments: number;
  failedAmount: number;
  successRate: number;
}

interface EnrichedPayment extends Doc<"payments"> {
  referral: Doc<"referrals"> | null;
}

// ============================================================================
// PAYMENT QUERIES
// ============================================================================

/**
 * Get payment by ID with full referral details
 */
export const getPaymentWithReferral = query({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentId);
    if (!payment) return null;

    // If payment has a referralId, fetch the referral details
    let referral = null;
    if (payment.referralId) {
      referral = await ctx.db.get(payment.referralId);
    }

    return {
      ...payment,
      referral,
    };
  },
});

/**
 * Get payment by CheckoutRequestID (for callback handling)
 */
export const getPaymentByCheckoutRequestId = query({
  args: {
    checkoutRequestId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_checkoutRequestId", (q) =>
        q.eq("checkoutRequestId", args.checkoutRequestId),
      )
      .first();
  },
});

/**
 * Get all payments for a physician (based on their referrals)
 */
export const getPhysicianPayments = query({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<EnrichedPayment[]> => {
    // Validate physician access
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.userId !== args.physicianId) {
      throw new Error("Unauthorized");
    }

    // First get all referrals for this physician
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referringPhysicianId", (q) =>
        q.eq("referringPhysicianId", args.physicianId),
      )
      .collect();

    const referralIds = referrals.map((r) => r._id);

    if (referralIds.length === 0) {
      return [];
    }

    // Get all payments
    const allPayments = await ctx.db.query("payments").collect();

    // Filter payments that belong to this physician's referrals
    let payments = allPayments.filter(
      (p) => p.referralId && referralIds.includes(p.referralId),
    );

    // Filter by status if provided
    if (args.status) {
      payments = payments.filter((p) => p.status === args.status);
    }

    // Sort by createdAt descending (newest first)
    payments.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit if provided
    if (args.limit && args.limit > 0) {
      payments = payments.slice(0, args.limit);
    }

    // Enrich with referral details
    const enrichedPayments = await Promise.all(
      payments.map(async (payment) => {
        const referral = payment.referralId
          ? await ctx.db.get(payment.referralId)
          : null;
        return {
          ...payment,
          referral,
        };
      }),
    );

    return enrichedPayments;
  },
});

/**
 * Get payment statistics for a physician
 */
export const getPhysicianPaymentStats = query({
  args: {
    token: v.string(),
    physicianId: v.id("users"),
  },
  handler: async (ctx, args): Promise<PhysicianPaymentStats> => {
    // Validate physician access
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.userId !== args.physicianId) {
      throw new Error("Unauthorized");
    }

    // Get all referrals for this physician
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referringPhysicianId", (q) =>
        q.eq("referringPhysicianId", args.physicianId),
      )
      .collect();

    const referralIds = referrals.map((r) => r._id);

    // Get all payments
    const allPayments = await ctx.db.query("payments").collect();
    const physicianPayments = allPayments.filter(
      (p) => p.referralId && referralIds.includes(p.referralId),
    );

    // Calculate statistics
    const completed = physicianPayments.filter((p) => p.status === "completed");
    const pending = physicianPayments.filter((p) => p.status === "pending");
    const failed = physicianPayments.filter((p) => p.status === "failed");

    const stats: PhysicianPaymentStats = {
      totalPayments: physicianPayments.length,
      totalAmount: physicianPayments.reduce((sum, p) => sum + p.amount, 0),

      completedPayments: completed.length,
      completedAmount: completed.reduce((sum, p) => sum + p.amount, 0),

      pendingPayments: pending.length,
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),

      failedPayments: failed.length,
      failedAmount: failed.reduce((sum, p) => sum + p.amount, 0),

      successRate: 0, // Will calculate below
    };

    // Calculate success rate
    stats.successRate =
      stats.totalPayments > 0
        ? Math.round((stats.completedPayments / stats.totalPayments) * 100)
        : 0;

    return stats;
  },
});

/**
 * Get payment by M-Pesa receipt number
 */
export const getPaymentByReceiptNumber = query({
  args: {
    receiptNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const payments = await ctx.db.query("payments").collect();
    return (
      payments.find((p) => p.mpesaReceiptNumber === args.receiptNumber) || null
    );
  },
});
