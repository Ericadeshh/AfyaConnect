import { v } from "convex/values";
import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

// ============================================================================
// ADMIN PAYMENT ANALYTICS
// ============================================================================

interface DateRange {
  startDate: number;
  endDate: number;
}

/**
 * Get comprehensive payment analytics for admin dashboard
 */
export const getPaymentAnalytics = query({
  args: {
    adminToken: v.string(),
    timeRange: v.optional(
      v.union(
        v.literal("today"),
        v.literal("week"),
        v.literal("month"),
        v.literal("year"),
        v.literal("all"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    // Validate admin access
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

    // Get date range based on timeRange
    const now = Date.now();
    const dateRange = getDateRange(args.timeRange || "month", now);

    // Get all payments
    const allPayments = await ctx.db.query("payments").collect();

    // Filter payments within date range
    const filteredPayments = allPayments.filter(
      (p) =>
        p.createdAt >= dateRange.startDate && p.createdAt <= dateRange.endDate,
    );

    // Calculate overview stats
    const overview = calculateOverviewStats(filteredPayments);

    // Calculate daily trends for chart
    const dailyTrends = calculateDailyTrends(filteredPayments, dateRange);

    // Get payments by status
    const byStatus = {
      pending: filteredPayments.filter((p) => p.status === "pending").length,
      completed: filteredPayments.filter((p) => p.status === "completed")
        .length,
      failed: filteredPayments.filter((p) => p.status === "failed").length,
    };

    // Get top paying facilities (sending facilities)
    const topFacilities = await getTopPayingFacilities(ctx, filteredPayments);

    // Get payment methods distribution (M-Pesa only for now)
    const paymentMethods = {
      mpesa: filteredPayments.length,
      total: filteredPayments.length,
    };

    // Get recent payments with referral details
    const recentPayments = await getRecentPaymentsWithDetails(
      ctx,
      filteredPayments.slice(0, 10),
    );

    return {
      overview,
      dailyTrends,
      byStatus,
      topFacilities,
      paymentMethods,
      recentPayments,
      totalPayments: filteredPayments.length,
      totalAmount: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
    };
  },
});

/**
 * Get daily payment trends for charts
 */
export const getPaymentTrends = query({
  args: {
    adminToken: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate admin access
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

    const days = args.days || 30;
    const endDate = Date.now();
    const startDate = endDate - days * 24 * 60 * 60 * 1000;

    const allPayments = await ctx.db.query("payments").collect();
    const recentPayments = allPayments.filter(
      (p) => p.createdAt >= startDate && p.createdAt <= endDate,
    );

    return calculateDailyTrends(recentPayments, { startDate, endDate });
  },
});

/**
 * Get payment summary by facility
 */
export const getPaymentsByFacility = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate admin access
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

    // Get all payments with referrals
    const allPayments = await ctx.db.query("payments").collect();

    // Group by facility
    const facilityMap = new Map();

    for (const payment of allPayments) {
      if (!payment.referralId) continue;

      const referral = await ctx.db.get(payment.referralId);
      if (!referral) continue;

      const facilityName = referral.referringHospital;
      const current = facilityMap.get(facilityName) || {
        facilityName,
        totalPayments: 0,
        totalAmount: 0,
        completedPayments: 0,
        completedAmount: 0,
      };

      current.totalPayments++;
      current.totalAmount += payment.amount;

      if (payment.status === "completed") {
        current.completedPayments++;
        current.completedAmount += payment.amount;
      }

      facilityMap.set(facilityName, current);
    }

    return Array.from(facilityMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10); // Top 10 facilities
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDateRange(range: string, now: number): DateRange {
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;
  const oneYear = 365 * oneDay;

  switch (range) {
    case "today":
      const startOfDay = new Date(now).setHours(0, 0, 0, 0);
      return {
        startDate: startOfDay,
        endDate: now,
      };
    case "week":
      return {
        startDate: now - oneWeek,
        endDate: now,
      };
    case "month":
      return {
        startDate: now - oneMonth,
        endDate: now,
      };
    case "year":
      return {
        startDate: now - oneYear,
        endDate: now,
      };
    case "all":
    default:
      return {
        startDate: 0,
        endDate: now,
      };
  }
}

function calculateOverviewStats(payments: Doc<"payments">[]) {
  const completed = payments.filter((p) => p.status === "completed");
  const pending = payments.filter((p) => p.status === "pending");
  const failed = payments.filter((p) => p.status === "failed");

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = completed.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);
  const failedAmount = failed.reduce((sum, p) => sum + p.amount, 0);

  const successRate =
    payments.length > 0
      ? Math.round((completed.length / payments.length) * 100)
      : 0;

  return {
    total: payments.length,
    totalAmount,
    completed: completed.length,
    completedAmount,
    pending: pending.length,
    pendingAmount,
    failed: failed.length,
    failedAmount,
    successRate,
    averageAmount:
      payments.length > 0 ? Math.round(totalAmount / payments.length) : 0,
  };
}

function calculateDailyTrends(
  payments: Doc<"payments">[],
  dateRange: DateRange,
) {
  const trends = [];
  const days = Math.ceil(
    (dateRange.endDate - dateRange.startDate) / (24 * 60 * 60 * 1000),
  );

  // Limit to 30 days max for performance
  const maxDays = Math.min(days, 30);

  for (let i = 0; i < maxDays; i++) {
    const date = new Date(dateRange.endDate - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const startOfDay = date.setHours(0, 0, 0, 0);
    const endOfDay = date.setHours(23, 59, 59, 999);

    const dayPayments = payments.filter(
      (p) => p.createdAt >= startOfDay && p.createdAt <= endOfDay,
    );

    trends.unshift({
      date: dateStr,
      count: dayPayments.length,
      amount: dayPayments.reduce((sum, p) => sum + p.amount, 0),
      completed: dayPayments.filter((p) => p.status === "completed").length,
    });
  }

  return trends;
}

async function getTopPayingFacilities(ctx: any, payments: Doc<"payments">[]) {
  const facilityMap = new Map();

  for (const payment of payments) {
    if (!payment.referralId) continue;

    const referral = await ctx.db.get(payment.referralId);
    if (!referral) continue;

    const facilityName = referral.referringHospital;
    const current = facilityMap.get(facilityName) || {
      name: facilityName,
      count: 0,
      amount: 0,
    };

    current.count++;
    current.amount += payment.amount;
    facilityMap.set(facilityName, current);
  }

  return Array.from(facilityMap.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
}

async function getRecentPaymentsWithDetails(
  ctx: any,
  payments: Doc<"payments">[],
) {
  const enriched = [];

  for (const payment of payments) {
    let patientName = "Unknown";
    let facilityName = "Unknown";

    if (payment.referralId) {
      const referral = await ctx.db.get(payment.referralId);
      if (referral) {
        patientName = referral.patientName;
        facilityName = referral.referredToFacility;
      }
    }

    enriched.push({
      ...payment,
      patientName,
      facilityName,
    });
  }

  return enriched;
}
